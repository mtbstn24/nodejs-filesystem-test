const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const fileDir = '../file/';
const minfileSize = 1024;
//const maxFileSize = 1024 * 1024 * 10; //10MB
const maxFileSize = 1024 * 10; //10KB
var writeDurations = [];
var finalDurations = [];
var writeDuration;

// var filePath = path.join(fileDir, `file-${fileSize}`)
// var testData = Buffer.alloc(fileSize);

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
    
        writeDurations.push({
            size: filesize,
            write: writeDurationNS,
            duration: writeDuration
        });
    
        sum = sum + writeDuration;
    }
    
    writeDuration = sum/10;
    
    finalDurations.push({
        Filesize: filesize,
        WriteDuration: writeDuration
    });

    console.log(writeDurations);
    
    console.log(`FileSize: ${filesize}, AvgDuration: ${writeDuration}`);
}

function writeProcessMultiple() {
    
    writeDurations = [];
    finalDurations = [];
    var fileSize = minfileSize;
    while(fileSize<=maxFileSize){
        writeProcess(fileSize);
        fileSize = fileSize + 1024;
    }
    console.log(finalDurations);
}


app.get('/', (req,res) => {
    //res.send('Connection successful');
    writeProcessMultiple();
    res.status(200).json(finalDurations);
});

app.listen(3000, ()=> console.log('App listening in port 3000.'));
