const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const fileDir = '../tmp/';
const minfileSize = 1024 * 10; //10KB
const maxFileSize = 1024 * 1024 * 100; //100MB
var writeDurations = [];
var finalDurations = [];
var writeDuration;
var filesizeInKB;
var csvString;

app.use((req,res,next)=>{
    console.log('\nTime: ', Date.now());
    next();
});

function writeProcess(filesize) {
    writeDurations = [];
    var filePath = path.join(fileDir, `file-${filesize}`)
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
        fs.rmSync(filePath);
    
        writeDurations.push({
            size: filesize,
            write: writeDurationNS,
            duration: writeDuration
        });
    
        sum = sum + writeDuration;
    }
    
    writeDuration = sum/10;
    filesizeInKB = filesize/1024;
    finalDurations.push({
        Filesize: filesizeInKB,
        WriteDuration: writeDuration
    });

    console.log(writeDurations); 
    console.log(`FileSize (KB): ${filesize}, AvgDuration (ms): ${writeDuration}`);
}

function writeProcessMultiple() {
    
    writeDurations = [];
    finalDurations = [];
    var fileSize = minfileSize;
    var index = 1;
    while(fileSize<=maxFileSize){
        writeProcess(fileSize);
        index++;
        // fileSize = Math.pow(fileSize,index);
        fileSize = fileSize + 1024*1024*2;
    }
    console.log(finalDurations);

    csvString = [
        ["FileSize (KB)", "Write Duration (ms)"],
        ...finalDurations.map(item => [
            item.Filesize, item.WriteDuration
        ])
    ].map(e => e.join(",")).join("\n");
}


app.get('/', (req,res) => {
    //res.send('Connection successful');
    writeProcessMultiple();
    //res.status(200).json(finalDurations);
    res.statusCode = 200;
    res.setHeader('Content-Type','text/csv');
    res.write(csvString);
    res.end();
});

app.listen(3000, ()=> console.log('App listening in port 3000.'));
