const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const os = require('os');

const fileDir = '../tmp/';
const minfileSize = 1024 * 10; //10KB
const maxFileSize = 1024 * 1024 * 100; //100MB
var writeDurations = [];
var readDurations = [];
var finalDurations = [];
var writeDuration, readDuration;
var filesizeInKB;
var csvString;

app.use((req,res,next)=>{
    console.log('\nTime: ', Date.now());
    next();
});

function fileProcess(filesize) {
    var filePath = path.join(fileDir, `file-${filesize}`)

    writeProcess(filesize, filePath);
    readProcess(filesize, filePath);

    filesizeInKB = filesize/1024;
    finalDurations.push({
        Filesize: filesizeInKB,
        WriteDuration: writeDuration,
        ReadDuration: readDuration,
        ReadWriteDuration: writeDuration + readDuration,
    });
}

function writeProcess(filesize, filepath) {
    writeDurations = [];
    var filePath = filepath;
    var testData = Buffer.alloc(filesize);

    var writeStart = process.hrtime.bigint();
    fs.writeFileSync(filePath,testData);
    var writeEnd = process.hrtime.bigint();
    var writeDurationNS = (writeEnd - writeStart);
    var durationStr = writeDurationNS.toString();
    writeDuration = parseInt(durationStr,10)/1000000;
    
    var sum=0;
    
    for (let index = 0; index < 10; index++) {
        writeStart = process.hrtime.bigint();
        fs.writeFileSync(filePath,testData);
        writeEnd = process.hrtime.bigint();
        writeDurationNS = (writeEnd - writeStart);
        durationStr = writeDurationNS.toString();
        writeDuration = parseInt(durationStr,10)/1000000;
    
        writeDurations.push({
            size: filesize,
            write: writeDurationNS,
            duration: writeDuration
        });
    
        sum = sum + writeDuration;
    }
    
    writeDuration = sum/10;

    console.log(writeDurations); 
    console.log(`FileSize (KB): ${filesize}, AvgDuration (ms): ${writeDuration}`);
}

function readProcess(filesize, filepath) {
    readDurations = [];
    var filePath = filepath;

    var readStart = process.hrtime.bigint();
    fs.readFileSync(filePath);
    var readEnd = process.hrtime.bigint();
    var readDurationNS = (readEnd - readStart);
    var durationStr = readDurationNS.toString();
    readDuration = parseInt(durationStr,10)/1000000;
    
    var sum=0;
    
    for (let index = 0; index < 10; index++) {
        readStart = process.hrtime.bigint();
        fs.readFileSync(filePath);
        readEnd = process.hrtime.bigint();
        readDurationNS = (readEnd - readStart);
        durationStr = readDurationNS.toString();
        readDuration = parseInt(durationStr,10)/1000000;
    
        readDurations.push({
            size: filesize,
            read: readDurationNS,
            duration: readDuration
        });
    
        sum = sum + readDuration;
    }
    
    readDuration = sum/10;
    fs.rmSync(filePath);

    console.log(readDurations); 
    console.log(`FileSize (KB): ${filesize}, AvgDuration (ms): ${readDuration}`);
}

function writeProcessMultiple() {
    
    writeDurations = [];
    finalDurations = [];
    var fileSize = minfileSize;
    var index = 1;
    while(fileSize<=maxFileSize){
        fileProcess(fileSize);
        index++;
        // fileSize = Math.pow(fileSize,index);
        fileSize = fileSize + 1024*1024*2;
    }
    console.log(finalDurations);

    csvString = [
        ["FileSize (KB)", "Write Duration (ms)", "Read Duration (ms)", "Read and Write Duration (ms)"],
        ...finalDurations.map(item => [
            item.Filesize, item.WriteDuration, item.ReadDuration, item.ReadWriteDuration
        ])
    ].map(e => e.join(",")).join("\n");
}


app.get('/file', (req,res) => {
    //res.send('Connection successful');
    writeProcessMultiple();
    //res.status(200).json(finalDurations);
    res.statusCode = 200;
    res.setHeader('Content-Type','text/csv');
    res.write(csvString);
    res.end();
});

app.get('/',(req,res) => {
    res.statusCode = 200;
    res.send(`Connection successful to the host: ${os.hostname} </br>Use the /file endpoint to Benchmark the File oprations`)
})

app.listen(3000, ()=> console.log('App listening in port 3000.'));
