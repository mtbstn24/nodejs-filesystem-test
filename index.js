const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const fileDir = '../file/';
const fileSize = 1024;
const maxFileSize = 1024 * 1024 * 10; //10MB
var durations = [];

const filePath = path.join(fileDir, `file-${fileSize}`)
const testData = Buffer.alloc(fileSize);

app.use((req,res,next)=>{
    console.log('\nTime: ', Date.now());
    next();
});

function writeProcess(filesize) {
    durations = [];

    var writeStart = process.hrtime.bigint();
    fs.writeFileSync(filePath,testData);
    var writeEnd = process.hrtime.bigint();
    var writeDuration = (writeEnd - writeStart);
    var durationStr = writeDuration.toString();
    var duration = parseInt(durationStr,10)/1000000;
    
    var sum=0;
    
    for (let index = 0; index < 10; index++) {
        writeStart = process.hrtime.bigint();
        fs.writeFileSync(filePath,testData);
        writeEnd = process.hrtime.bigint();
        writeDuration = (writeEnd - writeStart);
        durationStr = writeDuration.toString();
        duration = parseInt(durationStr,10)/1000000;
    
        durations.push({
            size: fileSize,
            write: writeDuration,
            duration: duration
        });
    
        sum = sum + duration;
    }
    
    duration = sum/10;
    
    console.log(durations);
    
    console.log(`FileSize: ${fileSize}, AvgDuration: ${duration}`);      
}

app.get('/', (req,res) => {
    //res.send('Connection successful');
    writeProcess();
    res.send(`fileSize: ${durations[0].size}, duration: ${durations[0].duration}`);
});

app.listen(3000, ()=> console.log('App listening in port 3000.'));
