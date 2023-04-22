// const fs = require('fs');
// const path = require('path');
// const express = require('express');
// const app = express();
// const os = require('os');
// const { sampleJson } = require('./sample');
// const { default: axios } = require('axios');
// require('dotenv').config();

// const fileDir = process.env.DIR;
// const minfileSize = 1024 * 10; //10KB
// const maxFileSize = 1024 * 1024 * 100; //100MB
// var writeDurations = [];
// var readDurations = [];
// var finalDurations = [];
// var calDurations;
// var writeDuration, readDuration;
// var filesizeInKB;
// var csvString;
// var fibString;
// var status;

// app.use((req,res,next)=>{
//     console.log('\nTime: ', Date.now());
//     next();
// });

// function writeProcess(filesize, filepath) {
//     writeDurations = [];
//     var filePath = filepath;
//     var testData = Buffer.alloc(filesize);

//     var writeStart = process.hrtime.bigint();
//     var writeEnd = process.hrtime.bigint();
//     var writeDurationNS = (writeEnd - writeStart);
//     var durationStr = writeDurationNS.toString();
//     writeDuration = parseInt(durationStr,10)/1000000;
    
//     var sum=0;
    
//     for (let index = 0; index < 10; index++) {
//         writeStart = process.hrtime.bigint();
//         fs.writeFileSync(filePath,testData);
//         writeEnd = process.hrtime.bigint();
//         writeDurationNS = (writeEnd - writeStart);
//         durationStr = writeDurationNS.toString();
//         writeDuration = parseInt(durationStr,10)/1000000;
    
//         writeDurations.push({
//             size: filesize,
//             write: writeDurationNS,
//             duration: writeDuration
//         });
    
//         sum = sum + writeDuration;
//     }
    
//     writeDuration = sum/10;

//     console.log(writeDurations); 
//     console.log(`FileSize (KB): ${filesize}, AvgDuration (ms): ${writeDuration}`);
// }

// function readProcess(filesize, filepath) {
//     readDurations = [];
//     var filePath = filepath;

//     var readStart = process.hrtime.bigint();
//     var readEnd = process.hrtime.bigint();
//     var readDurationNS = (readEnd - readStart);
//     var durationStr = readDurationNS.toString();
//     readDuration = parseInt(durationStr,10)/1000000;
    
//     var sum=0;
    
//     for (let index = 0; index < 10; index++) {
//         readStart = process.hrtime.bigint();
//         fs.readFileSync(filePath);
//         readEnd = process.hrtime.bigint();
//         readDurationNS = (readEnd - readStart);
//         durationStr = readDurationNS.toString();
//         readDuration = parseInt(durationStr,10)/1000000;
    
//         readDurations.push({
//             size: filesize,
//             read: readDurationNS,
//             duration: readDuration
//         });
    
//         sum = sum + readDuration;
//     }
    
//     readDuration = sum/10;
//     fs.rmSync(filePath);

//     console.log(readDurations); 
//     console.log(`FileSize (KB): ${filesize}, AvgDuration (ms): ${readDuration}`);
// }

// function fileProcess(filesize) {
//     var filePath = path.join(fileDir, `file-${filesize}`)

//     writeProcess(filesize, filePath);
//     readProcess(filesize, filePath);

//     filesizeInKB = filesize/1024;
//     finalDurations.push({
//         Filesize: filesizeInKB,
//         WriteDuration: writeDuration,
//         ReadDuration: readDuration,
//         ReadWriteDuration: writeDuration + readDuration,
//     });
// }

// function fileProcessMultiple() {
//     status = false;
//     writeDurations = [];
//     finalDurations = [];
//     var fileSize = minfileSize;
//     while(fileSize<=maxFileSize){
//         fileProcess(fileSize);
//         fileSize = fileSize + 1024*1024*2;
//     }
//     console.log(finalDurations);
//     csvString = [
//         ["FileSize (KB)", "Write Duration (ms)", "Read Duration (ms)", "Read and Write Duration (ms)"],
//         ...finalDurations.map(item => [
//             item.Filesize, item.WriteDuration, item.ReadDuration, item.ReadWriteDuration
//         ])
//     ].map(e => e.join(",")).join("\n");

//     var filePathCSV = path.join(fileDir, `csvString.csv`);
//     fs.writeFileSync(filePathCSV, csvString);
//     status = true;
// }

// function fibonacci(n) {
//     if (n <= 1) {
//       return n;
//     }
//     return fibonacci(n - 1) + fibonacci(n - 2);
//   }

//   function getFibString(){
//     calDurationAvgs = [];
//     number = [0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44];
//     number_array = []
//     fibonacci_array = []
//     calDurations = []
//     let result;
//     let len = number.filter(function(x){return x !== 'undefined'}).length
//     for (let index = 0; index < len; index++) {
//         let calDurationSum = 0.0000
//         for (let iter = 0; iter < 5; iter++) {
//             calStart = process.hrtime.bigint();
//             result = fibonacci(number[index]);
//             calEnd = process.hrtime.bigint();
//             calDurationNS = (calEnd - calStart);
//             durationStr = calDurationNS.toString();
//             calDuration = parseInt(durationStr,10)/1000000;
//             calDurationSum = calDurationSum + calDuration
//         }

//         calDurationAvg = calDurationSum/5
//         calDurationAvgs.push(calDurationAvg)
//         calDurations.push({
//             FibonacciNumber: number[index],
// 			FibonacciValue:  result,
// 			CalDuration:     calDurationAvg,
//         });

//     }
//     fibString = [
//         ["Fibonacci Number", "Fibonacci Value", "Calculation Duration (ms)"],
//         ...calDurations.map(item => [
//             item.FibonacciNumber, item.FibonacciValue, item.CalDuration
//         ])
//     ].map(e => e.join(",")).join("\n");
//     console.log(fibString);

//   }

// app.get('/externalapi', (req,res) => {
//     const apiKey = req.headers['API-Key'];
//     axios.get('https://jsonplaceholder.typicode.com/users').then(jsonres => {
//         res.statusCode = 200;
//         res.write(JSON.stringify(jsonres.data, null, " "));
//         res.end()
//     }).catch(err => {
//         res.send(err);
//     });
// });

// app.get('/json', (req,res) => {
//     const apiKey = req.headers['API-Key'];
//     var sJson = sampleJson.concat({time: `${Date.now()}`})
//     res.statusCode = 200;
//     res.setHeader('Content-Type','text/json');
//     res.send(JSON.stringify(sJson, null, " "));
//     res.end();
// });

// app.get('/file', (req,res) => {
//     const apiKey = req.headers['API-Key'];
//     fileProcessMultiple();
//     res.statusCode = 200;
//     res.setHeader('Content-Type','text/csv');
//     res.write(csvString);
//     res.end();
// });

// app.get('/response', (req,res) => {
//     const apiKey = req.headers['API-Key'];
//     if(status){
//         res.statusCode = 200;
//         res.setHeader('Content-Type','text/csv');
//         res.write(csvString);
//         res.end();
//     }else{
//         res.statusMessage = "Respond not found or Process not completed.";
//         res.status(404).send("Respond not found or Process not completed. \nMake a request to /file endpoint first. \nWait for some time and try again if you have already requested /file endpoint.").end();
//     }
// });

// app.get('/fibonacci', (req, res) => {
//     getFibString();
//     res.statusCode = 200;
//     res.setHeader('Content-Type','text/csv');
//     res.write(fibString);
//     res.end();
//   });

// app.get('/fibresponse', (req,res) => {
//     const apiKey = req.headers['API-Key'];
//     if(fibString){
//         res.statusCode = 200;
//         res.setHeader('Content-Type','text/csv');
//         res.write(fibString);
//         res.end();
//     }else{
//         res.statusMessage = "Respond not found or Process not completed.";
//         res.status(404).send("Respond not found or Process not completed. \nMake a request to /fibonacci endpoint first. \nWait for some time and try again if you have already requested /file endpoint.").end();
//     }
// });

// app.get('/',(req,res) => {
//     const apiKey = req.headers['API-Key'];
//     res.statusCode = 200;
//     res.write(`Connection successful to the host: ${os.hostname}`)
//     res.write('\nUse the /file endpoint to Benchmark the File oprations')
//     res.write('\nUse the /response endpoint to get the csv string of the response of Benchmarking the File oprations')
//     res.write('\nUse the /json endpoint to get a sample json endpoint');
//     res.write('\nUse the /externalapi endpoint to get a sample json response from an external API')
//     res.write('\nUse the /fibonacci endpoint to calculate Fibonacci numbers and Durations')
//     res.write('\nUse the /fibresponse endpoint to get the Fibonacci Durations as csv\n\n')
//     res.end();
// })

const app = require("./app");

app.listen(3000, ()=> console.log('App listening in port 3000.'));
