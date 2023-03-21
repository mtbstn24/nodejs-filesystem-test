const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const os = require('os');
require('dotenv').config();

const fileDir = process.env.DIR;
const minfileSize = 1024 * 10; //10KB
const maxFileSize = 1024 * 1024 * 100; //100MB
var writeDurations = [];
var readDurations = [];
var finalDurations = [];
var writeDuration, readDuration;
var filesizeInKB;
var csvString;
var status;

app.use((req,res,next)=>{
    console.log('\nTime: ', Date.now());
    next();
});

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

function fileProcessMultiple() {
    
    status = false;
    writeDurations = [];
    finalDurations = [];
    var fileSize = minfileSize;
    var index = 1;
    while(fileSize<=maxFileSize){
        fileProcess(fileSize);
        index++;
        fileSize = fileSize + 1024*1024*2;
    }
    console.log(finalDurations);

    csvString = [
        ["FileSize (KB)", "Write Duration (ms)", "Read Duration (ms)", "Read and Write Duration (ms)"],
        ...finalDurations.map(item => [
            item.Filesize, item.WriteDuration, item.ReadDuration, item.ReadWriteDuration
        ])
    ].map(e => e.join(",")).join("\n");

    var filePathCSV = path.join(fileDir, `csvString.csv`);
    fs.writeFileSync(filePathCSV, csvString);
    status = true;
}

app.get('/file', (req,res) => {
    const apiKey = req.headers['API-Key'];
    fileProcessMultiple();
    res.statusCode = 200;
    res.setHeader('Content-Type','text/csv');
    res.write(csvString);
    res.end();
});

app.get('/response', (req,res) => {
    const apiKey = req.headers['API-Key'];
    if(status){
        res.statusCode = 200;
        res.setHeader('Content-Type','text/csv');
        res.write(csvString);
        res.end();
    }else{
        res.status(404).send('Respond not found or Process not completed. Wait for some time and try again')
    }
});

app.get('/',(req,res) => {
    const apiKey = req.headers['API-Key'];
    res.statusCode = 200;
    res.write(`Connection successful to the host: ${os.hostname}`)
    res.write('\nUse the /file endpoint to Benchmark the File oprations\n')
    res.write('\nUse the /response endpoint to get the csv string of the response of Benchmarking the File oprations\n')
    res.end();
})

app.listen(3000, ()=> console.log('App listening in port 3000.'));
