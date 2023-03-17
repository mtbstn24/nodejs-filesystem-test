const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const fileDir = '../file/';
const fileSize = 1024;
const maxFileSize = 1024 * 1024 * 10; //10MB
const durations = [];

app.use((req,res,next)=>{
    console.log('Time: ',Date.now());
    next();
});

const filePath = path.join(fileDir, `file-${Date.now()}-${fileSize}`)
const testData = Buffer.alloc(fileSize);

const writeStart = process.hrtime.bigint();
fs.writeFileSync(filePath,testData);
const writeEnd = process.hrtime.bigint();
const writeDuration = (writeEnd - writeStart);

const durationStr = writeDuration.toString();
const duration = parseInt(durationStr,10)/1000000;

durations.push({
    size: fileSize,
    write: writeDuration,
    duration: duration
});

console.log(durations);

app.get('/', (req,res) => {
    res.send('Connection successful');
});

app.listen(3000, ()=> console.log('App listening in port 3000.'));
