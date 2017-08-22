// Load modules
const low = require('lowdb');
const db = low('db.json');

// Set some defaults if your JSON file is empty
db.defaults({
  //
  waterHeaterParams: [],

  schedule: [],
  // RecentPowerConsumption used for traceing a single bath power usage
  RecentPowerConsumption: [],

  RecentTemperature: [],
  // each user has mappig between HOT /SEMI / COLD and actual temperature
  UserPreferredTemperature: [],
  // For reports
  WaterHeaterOnPerBath: [],
  // For reports
  PowerConsumptionPerWeek: [],
//==========================================//
  // For reports
  //TODO: I added those values manually to db, check if I can not do that..
  FeedbackHistory: [
    {"too hot":0,
    "too cold":0,
    "just right":0}]
//==========================================//
})
.write()

exports.scheduleSave = (obj) => {
  console.log("DB: scheduleSave");
  obj.status = "NEW"
  // Add a schedule
  db.get('schedule')
    .push(obj)
    .write()
}
exports.getAllSchedule = () => {
  console.log("dbService: getAllSchedule");
  return db.get('schedule')
    .value()
}

exports.getAllTemperature = () => {
  return db.get('RecentTemperature')
    .value()
}

exports.getWaterHeaterParams = () => {
  return db.get('waterHeaterParams')
           .value()[0];
}

exports.setWaterHeaterParams = (obj) => {
  db.get('waterHeaterParams')
    .remove()
    .write()
  return db.get('waterHeaterParams')
  .push(obj)
  .write()
}

exports.newUserPreferredTemperature = (obj) => {
  return db.get('UserPreferredTemperature')
  .push(obj)
  .write()
}

exports.setUserPreferredTemperature = (userName, heatLevel, heatValue) => {
  db.get('UserPreferredTemperature')
   .find({ userName: userName })
   .assign({[heatLevel]: heatValue})
  .write()
}

exports.getUserPreferredTemperature = (userName, heatLevel) => {
  console.log("getUserTemp: " + userName + " " + heatLevel)
  let obj = db.get('UserPreferredTemperature')
    .find({ userName: userName })
    .value();
  if (obj == undefined){
    throw "userName" + userName + "does not exist"
  }
  return obj[heatLevel]
}

exports.getBath = (bathTime) => {
  return db.get('schedule')
    .find({ bathTime: bathTime })
    .value();
}

///////////////////////////
exports.WaterHeaterOnPerBathSave = (obj) => {
  db.get('WaterHeaterOnPerBath')
    .push(obj)
    .write()
}

exports.newFeedback = (bathFeedback) => {
  console.log("new feedback")
  let obj = db.get('FeedbackHistory')
    .value()[0]
  let currentNumberOfFeedbacks = obj[bathFeedback.feedback]
  // console.log("new feedback for " + JSON.stringify(obj) + " is: " + currentNumberOfFeedbacks)
  db.get('FeedbackHistory')
   .first()
   .assign({[bathFeedback.feedback]: currentNumberOfFeedbacks + 1})
  .write()

}

exports.getFeedback = () => {
  return db.get('FeedbackHistory')
    .value()
}

exports.clearFeedback = () => {
  db.get('FeedbackHistory')
    .remove()
    .write()
  let obj = { "too hot": 0,
              "too cold": 0,
              "just right": 0}
  db.get('FeedbackHistory')
    .push(obj)
    .write()
}

exports.newTemperatureReport = (obj) => {
  db.get('RecentTemperature')
    .push(obj)
    .write()
}


exports.newPowerOperation = (obj) => {
  db.get('RecentPowerConsumption')
    .push(obj)
    .write()
}

exports.clearRecentPowerConsumption = () => {
  db.get('RecentPowerConsumption')
    .remove()
    .write()
}

exports.getAllRecentPowerOperations = function(){
    return db.get('RecentPowerConsumption')
             .value();
}


exports.getAllWaterHeaterOnPerBath = function(){
    return db.get('WaterHeaterOnPerBath')
             .value();
}
// exports.AverageWaterHeaterOnPerBath = () => {
//   let sum=0;
//   for (let i=0 ; i< getAllWaterHeaterOnPerBath().length ; i++){
//     AverageWaterHeaterOnPerBath[i].amount
//   }
//   return db.get('WaterHeaterOnPerBath')
//     .value()
// }
