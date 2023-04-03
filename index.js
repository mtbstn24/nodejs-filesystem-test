const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const os = require('os');
const { sampleJson } = require('./sample');
const { default: axios } = require('axios');
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
    while(fileSize<=maxFileSize){
        fileProcess(fileSize);
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

function fibonacci(n) {
    if (n <= 1) {
      return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
  }

app.get('/externalapi', (req,res) => {
    const apiKey = req.headers['API-Key'];
    axios.get('https://jsonplaceholder.typicode.com/users').then(jsonres => {
        res.statusCode = 200;
        res.write(JSON.stringify(jsonres.data, null, " "));
        res.end()
    }).catch(err => {
        res.send(err);
    });
});

app.get('/json', (req,res) => {
    const apiKey = req.headers['API-Key'];
    res.statusCode = 200;
    res.setHeader('Content-Type','text/json');
    res.send(JSON.stringify(sampleJson, null, " "));
    res.end();
});

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
        res.statusMessage = "Respond not found or Process not completed.";
        res.status(404).send("Respond not found or Process not completed. \nMake a request to /file endpoint first. \nWait for some time and try again if you have already requested /file endpoint.").end();
    }
});

app.get('/fibonacci/:n', (req, res) => {
    const n = parseInt(req.params.n);
    calStart = process.hrtime.bigint();
    const result = fibonacci(n);
    calEnd = process.hrtime.bigint();
    var calDurationNS = (calEnd - calStart);
    durationStr = calDurationNS.toString();
    var calDuration = parseInt(durationStr,10)/1000000;
    res.send({ Result: result, CalculationDuration: calDuration });
  });

app.get('/',(req,res) => {
    const apiKey = req.headers['API-Key'];
    res.statusCode = 200;
    res.write(`Connection successful to the host: ${os.hostname}`)
    res.write('\nUse the /file endpoint to Benchmark the File oprations')
    res.write('\nUse the /response endpoint to get the csv string of the response of Benchmarking the File oprations')
    res.write('\nUse the /json endpoint to get a sample json endpoint');
    res.write('\nUse the /externalapi endpoint to get a sample json response from an external API')
    res.write('\nUse the /fibanacci/n endpoint to get the nth fibonacci number and Duration\n\n')
    res.end();
})

app.listen(3000, ()=> console.log('App listening in port 3000.'));
