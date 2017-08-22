// Load modules
const dbService = require('./dbService');
const fileIO = require('./ioSmartWaterHeater')
const fs = require('fs');
const filePath = "/sys/bus/w1/devices/28-0416589136ff/w1_slave";  //get actual path
const regxValid = new RegExp('YES');
// exports.getAllTemperature = () => {
//
//   // let tempReport = {dateTime:Time, temperature:temp};
//   // dbService.newTemperatureReport(tempReport);
//   // return tempReport;
// }

exports.getTemperature = () => {
  let temp;
  let data = fileIO.readFile("myFile.txt")
  //console.log("sync data: " + data);
  let isDataValid = /YES/.test(data);
  while (!isDataValid){
    console.log("data was not valid on tempReporter, reading again");
    data = fileIO.readFile("myFile.txt");
    isDataValid = /YES/.test(data);
  }
  let temp_withPrefix = /t=\d{5}/.exec(data); //get "t=23937" out of file
  temp = /\d{5}/.exec(temp_withPrefix);  //remove "t=""
  let finalTemp = temp/1000 - (temp/1000)%1  // return temp as int celsuse eg.23937 --> 29
  console.log("temp: " + finalTemp);
  return finalTemp
}
