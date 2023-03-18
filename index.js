const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const fileDir = '../file/';
const fileSize = 1024;
const maxFileSize = 1024 * 1024 * 10; //10MB
var writeDurations = [];
var writeDuration;

const filePath = path.join(fileDir, `file-${fileSize}`)
const testData = Buffer.alloc(fileSize);

app.use((req,res,next)=>{
    console.log('\nTime: ', Date.now());
    next();
});

function writeProcess(filesize) {
    writeDurations = [];

    var writeStart = process.hrtime.bigint();
    fs.writeFileSync(filePath,testData);
    var writeEnd = process.hrtime.bigint();
    var writeDurationNS = (writeEnd - writeStart);
    var durationStr = writeDurationNS.toString();
    writeDuration = parseInt(durationStr,10)/1000000;
    
    var sum=0;
    
    for (let index = 0; index < 10; index++) {
        var writeStart = process.hrtime.bigint();
        fs.writeFileSync(filePath,testData);
        var writeEnd = process.hrtime.bigint();
        var writeDurationNS = (writeEnd - writeStart);
        var durationStr = writeDurationNS.toString();
        writeDuration = parseInt(durationStr,10)/1000000;
    
        writeDurations.push({
            size: fileSize,
            write: writeDurationNS,
            duration: writeDuration
        });
    
        sum = sum + writeDuration;
    }
    
    writeDuration = sum/10;
    
    console.log(writeDurations);
    
    console.log(`FileSize: ${fileSize}, AvgDuration: ${writeDuration}`);      
}

app.get('/', (req,res) => {
    //res.send('Connection successful');
    writeProcess();
    res.status(200).json({FileSize: `${fileSize}`, AvgDuration: `${writeDuration}`});
});

app.listen(3000, ()=> console.log('App listening in port 3000.'));
