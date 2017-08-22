// Load modules
const dbService = require('./dbService');
const calendar = require('./calendar');
const powerManager = require('./powerManager');
const TempReporter = require('./temperatureReporter');


calendar.registerListener(onTimeBeforeBath);
let number_of_needHeating = 0

function onTimeBeforeBath(bath){
  console.log("LU: event handler" + JSON.stringify(bath) + "***********")
  if (bath.status == "DELETED"){
      console.log("LU: with deleted bath.. not doing anything")
      return
  }
  // if we reach bath time -->handle in
  if (bath.bathTime <= new Date()){
    setNeedHeating(bath, false)
    onBathTimeArrive(bath.bathTime)
  } else {
    let isNeedTurnOn = doNeedHeatingCalculationForBath(bath)
    setNeedHeating(bath, isNeedTurnOn)
    }
  console.log("LU: event handler --> exit***********")
}

// setNeedHeating is a wrapper for needHeating (So we con couple number_of_needHeating).
// number_of_needHeating acts like semaphore, updating power state only when change 0<->1
function setNeedHeating(bath, newState){
  // if we really have a change
  if (bath.needHeating != newState){
    console.log("CHANGE in bath needHeating. previous: " + bath.needHeating + ". new state: " + newState +
                " . num of bath before change: " + number_of_needHeating)
    if (newState){
        bath.needHeating = true
        number_of_needHeating ++
        if (number_of_needHeating == 1){
          // change 0-->1 means we were off --> need to turn on
          assertState("off")
          powerManager.switchOn()
        }
    } else {
      // new status is false
      bath.needHeating = false
      number_of_needHeating --
      if (number_of_needHeating == 0){
        // change 1-->0 means we were on  --> need to turn off
        assertState("on")
        powerManager.switchOff()
      }
    }
  }
}

function assertState(currentState){
  if (powerManager.getState() != currentState){
    console.error();("ASSERTION ERROR: expecting: " + currentState + " but current is: " + powerManager.getState())
  }
}

// returns the time needed for heating according to temperature difference and the water heater params
function doNeedHeatingCalculationForBath(bath){
  // a single bath might need more heating meaning return true, else false
  if (bath.bathTime <= new Date()){
    console.log("LU: bath time arrived")
    return false
  }
  // 1. read temperature from thermocouple
  let actualTemp = TempReporter.getTemperature()
  // 2. read UserPreferredTemperature
  let bathNeededTemp = dbService.getUserPreferredTemperature(bath.userName, bath.heatLevel)
  console.log("doNeedHeatingCalculationForBath getPre  post")
  // 3. verify temerature delta against time, and see if we need to turn on waterHeater
  let dT = bathNeededTemp - actualTemp
  if (dT <= 0 ){
    console.log("LU: we arrived desiered temperature. actual: " + actualTemp + " desiered: " + bathNeededTemp)
    return false
  }
  let waterHeaterParams = dbService.getWaterHeaterParams()
  // vol [liter]*1[kg/liter]*dT[celcuse]* 0.0016[kWh/kcal] * [1/kW] * [60*min/h]  = [min]
  // kcal amount of energy to raise 1 degree celcsue 1 kg of water
  const kCal2kWattHour = 0.0016 // convert heat energey to electric energy
  let heatingTime = waterHeaterParams.volume * dT * 0.0016 / waterHeaterParams.kwatt * 60 // minutes
  console.log("now: " + new Date)
  let timeTillBath = (new Date(bath.bathTime) - new Date() )/1000 /60 //convert ms to minutes
  if (timeTillBath <= heatingTime){
    console.log("LU: need to raise " + dT + " deg that takes " + heatingTime + " min. we have " + timeTillBath + " min till bath")
    return true
  }
  console.log("LU: not time for turning on water heater yet. heating time " + heatingTime + ". we have " + timeTillBath)
  return false
}
// UI -> LU
exports.getTemperature = function (){
  return TempReporter.getTemperature();
}

// TODO: need to add ip into some table..
//UI -> LU
exports.handleLogin = function(login){
  let userPref = {
    userName: login.userName,
    HOT: 60,
    SEMI: 50,
    COLD: 40
  }
  console.log("new login: ", JSON.stringify(userPref))
  dbService.newUserPreferredTemperature(userPref)
  return "OK"
}

exports.getFeedback = function(){
  return dbService.getFeedback();
}

function onBathTimeArrive (bathTime){
  // Once the Logical unit receive a last notification of a bath, namely, a bath that was scheduled to now.
  // It will:
  // 1. Request to read all data from "recent power consumption".
  // 2. Calculate how much time the water heater was on, insert a single line into "Power consumption per bath". In order for calculation be correct, last row must be "off" which should hold.
  // Add the calculated value into "Power consumption per week".
  // 3. Delete all the data from "recent power consumption".
  let entries = dbService.getAllRecentPowerOperations();
  console.log(JSON.stringify(entries));
  let minutesOn = 0;
  for (let i= 0; i < entries.length - 1 ; i++ ) {
    // [0] 10:00  ON,  [1] 11:00 OFF  => one hour on
    if(entries[i].mode == "on" && entries[i + 1].mode == "off"){
      t1 = new Date(entries[i+1].dateTime);
      t0 = new Date(entries[i].dateTime);
      minutesOn += (t1.getTime() - t0.getTime()) / (1000 *60 );  //convert to minutes
      // console.log("i: " + entries[i].bathTime + " i+1: " + entries[i+1].bathTime  + " delta: " + minutesOn);
      //console.log("i:" + entries[i].mode + " i+1" + entries[i+1].mode);
    }
  }
  dbService.WaterHeaterOnPerBathSave({"bathTime":new Date(bathTime), "minutesOn":minutesOn})
  dbService.clearRecentPowerConsumption();
  console.log(" TOTAL min " + minutesOn);
}

function roundTime(dateTime){
  let minutes = dateTime.getMinutes();
  minutes = minutes - minutes % 15 + 15;
  dateTime.setMilliseconds(0);
  dateTime.setSeconds(0);
  dateTime.setMinutes(minutes);
  console.log("round-> " + dateTime);
  return dateTime
}

//UI -> LU view-calendar-request
exports.handleViewCalendarRequest = function (){
  console.log("LU: handleViewCalendarRequest");
  return calendar.calendarResponse();
}

//UI -> LU bath-schedule
exports.handleBathSchedule = function (bath){
  // LU -> CALENDAR
  console.log("LU: handleBathSchedule" + bath.bathTime);
  if (bath.bathTime < new Date()){
    throw " bath is in the past. ignoring request"
  }
  if (!_isValidHeatLevel(bath.heatLevel)){
    throw "INVALID_HEAT_LEVEL"
  }
  if (!_isValidRepeatType(bath.repeatType)){
    throw "INVALID_REPEAT_TYPE"
  }
  // bath.bathTime = roundTime(bath.bathTime);
  calendar.handleNewBath(bath);
  dbService.scheduleSave(bath);
  console.log("LU: handleBathSchedule --> exit");
  return "OK"
}

// UI -> LU bath-deletion
exports.handleBathDeletion = function (deleteBath){
  // deleteBath.bathTime = roundTime(deleteBath.bathTime);
  return calendar.handleBathDeletion(deleteBath);
}

exports.newFeedback = function (bathFeedback){
  if(!_isValidFeedback(bathFeedback.feedback)){
    return "INVALID_FEEDBACK"
  }
  //1. If user not satified - change his recomended temp:
  if (bathFeedback.feedback != "just right"){
    // 1.1 get bath from db
    // 1.2 get heatLevel
    let heatLevel = dbService.getBath(bathFeedback.bathTime).heatLevel
    // 1.3 get user prefered temp for heat level
    let UserPreferredTemperatureForHeatLevel = dbService.getUserPreferredTemperature(bathFeedback.userName, heatLevel)
    // 1.4 update the +5 / -5 celcuse
    if (bathFeedback.feedback == "too cold"){
      UserPreferredTemperatureForHeatLevel += 5
    } else {
      UserPreferredTemperatureForHeatLevel -= 5
    }
    console.log("new temp: " + UserPreferredTemperatureForHeatLevel + " heatLevel:" + heatLevel)
    dbService.setUserPreferredTemperature(bathFeedback.userName, heatLevel, UserPreferredTemperatureForHeatLevel)
  }
  console.log("LU: here2 ")
  //2. insert feedback to DB
  dbService.newFeedback(bathFeedback)
  console.log("LU: newFeedback --> exit");
  return "OK"
}

const NOT_FOUND = -1

function _isValidHeatLevel(heatLevel){
  let possibeHeatLevel = ["HOT", "SEMI", "COLD"]
  return (possibeHeatLevel.indexOf(heatLevel) != NOT_FOUND)
}

function _isValidFeedback(feedback){
  let possibleFeedback = ["just right", "too cold", "too hot"]
  return (possibleFeedback.indexOf(feedback) != NOT_FOUND)
}

function _isValidRepeatType(repeatType){
  let possibleRepeatType = ["DAILY", "WEEKLY", "NONE"]
  return (possibleRepeatType.indexOf(repeatType) != NOT_FOUND)
}
