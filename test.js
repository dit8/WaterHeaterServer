// const temp = require('./temperatureReporter');
// const power = require('./powerManager');
// const dbService = require('./dbService');
// const LU = require('./logicalUnit');
// const calendar = require('./calendar');
// const fileIO = require('./ioSmartWaterHeater')


let d = new Date()
let i = d.getTime()
let d2 = new Date(i)

console.log(d);
console.log(i);
console.log(d2);

//-----------------------------------------------
// fileIO.writeVal("myFile.txt", 1)
// // fileIO.readVal("myFile.txt")
// let a = new Date()
// a.setMinutes(a.getMinutes()+ 1)
// //let bath = {"bathTime":a,"userName":"shani","heatLevel":"SEMI","repeatType":"DAILY"}
// let bath = {"bathTime":"2017-07-20T02:30:00.000Z","userName":"shani","heatLevel":"SEMI","repeatType":"DAILY"}
// calendar.handleNewBath(bath)
//-----------------------------------------------

// let entries = [{"dateTime":"2017-07-24T18:35:29.150Z","mode":"on"},{"dateTime":"2017-07-24T18:45:29.414Z","mode":"off"}]
// let minutesOn = 0;
// for (let i= 0; i < entries.length - 1 ; i++ ) {
//   // [0] 10:00  ON,  [1] 11:00 OFF  => one hour on
//   if(entries[i].mode == "on" && entries[i + 1].mode == "off"){
//     t1 = new Date(entries[i+1].dateTime);
//     t0 = new Date(entries[i].dateTime);
//     minutesOn += (t1.getTime() - t0.getTime()) / (1000 *60 );  //convert to minutes
//   }
// }
// console.log(minutesOn);
//-----------------------------------------------
//// FUCKING COOL ////
// let a = {name: 'ordit'}
// let c = "name"
// let b = a[c]
// console.log(b)
//-----------------------------------------------
// let bathFeedback = {
//   bathTime: "2017-07-25T19:04:00.000Z",
//   userName: "dit",
//   feedback: "too cold"
// }
// LU.newFeedback(bathFeedback)

// console.log(heatLevel)
// dbService.newFeedback(bathFeedback)
// dbService.clearFeedback()
// let res = dbService.getFeedback()
// console.log(JSON.stringify(res))
//-----------------------------------------------

// let bath = dbService.getBath("2017-07-25T19:52:00.000Z")
// bath.heatLevel
// console.log(JSON.stringify(bath));

// let aa =     {
//       "userName": "dit",
//       "HOT": 60,
//       "SEMI": 50,
//       "COLD": 40}
//
//       aa
// dbService.setUserPreferredTemperature("dit", "SEMI", 50)
//-----------------------------------------------
// let b = "2017-07-24T18:35:29.150Z"
// let a = 2.6
// let o = {"bathTime":new Date(b), "minutesOn":a}
// dbService.WaterHeaterOnPerBathSave(o)
// console.log(JSON.stringify(o));
//-----------------------------------------------
// let v = {"vol": 150, "kwatt": 3}
// let dT = 25
// const kCal2kWattHour = 0.0016 // convert heat energey to electric energy
// let minutes = v.vol * dT * kCal2kWattHour / v.kwatt * 60
// console.log(minutes);
// temp.getTemperature();
// power.powerManager.setMode("myMode");
// power.switchOn();
// dbService.getAllRecentPowerOperations();
// LU.onBathTimeArrive();
//-----------------------------------------------
// a = new Date();
// b = new Date(2017);
// c = a > b ? a : b;
// console.log(a);
// console.log(b);
// console.log(c);



// const dd = require('datejs');
// a = new Date();
// b = new Date();
//
// c = (b.getTime()-a.getTime())/ (1000 *60 );  //min
//
// console.log("a: " + a + " b: " + b + " c: " + c);
// dbService.newPowerOperation("off");
