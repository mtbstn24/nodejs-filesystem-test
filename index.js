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
const writeStart = process.hrtime();
const testData = Buffer.alloc(fileSize);
fs.writeFileSync(filePath,testData);

const writeEnd = process.hrtime(writeStart);
const writeDuration = writeEnd[0] * 1000 + writeEnd[1] / 1000000;

durations.push({
    size: fileSize,
    write: writeDuration
});

console.log(durations);

app.get('/', (req,res) => {
    res.send('Connection successful.\n');
    res.send(durations);
});

app.listen(3000, ()=> console.log('App listening in port 3000.'));
