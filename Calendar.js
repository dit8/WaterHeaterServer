const EventEmitter = require('events');
const datejs = require('datejs');
// this entity hold all future baths and notify the logical unit of next upcomming bath.
// notification is sent
const myEE = new EventEmitter();
//*************************************************
//exports.registerListener
//exports.handleNewBath      LU<->calendar
//exports.handleBathDeletion LU<->calendar
//exports.calendarResponse   LU<->calendar
//*************************************************

// this approch works but is bad practice since LU code should be in LU..
// myEE.on('timeBeforeBath',(bath)=>{
//   //callback function
//   console.log("LU: event handler" + JSON.stringify(bath) + "***********")
//   //   //get user temperature from DB
//   //   //test temperatureReporter
//   //   //see if we need to heat
//   //   //set heater accourding
//
// })

exports.registerListener = function (callback){
  myEE.on('timeBeforeBath',(bath)=>{
    console.log("calendar: register event handler")
    callback(bath)
  })
}

Date.prototype.addHours = function(h) {
  this.setHours(this.getHours()+h);
   return this;
}

Date.prototype.addMin = function(m) {
  this.setMinutes(this.getMinutes()+m);
   return this;
}

// first notification sent to logical unit in [minutes]
const timeBeforeBath = 120;

// time between notification to logical unit in [minutes]
const notifyInterval = 0.5;  //15

// all scheduled baths
let baths = [];

//LU -> CALENDAR
exports.handleNewBath = function(bath) {
    console.log("#calendar: handleNewBath ");

    if (bath.bathTime < _now()){
      throw "bath is in the past: " + bath.bathTime.toUTCString()  + " now: " + _now().toUTCString()
    }
    // register the bath in the object
    baths.push(bath);
    let firstNotificationTime = _firstNotificationTime(new Date(bath.bathTime));
    // max safe integer in js is +/- 9007199254740991 which means we can safely calculate for next 289583 years
    let millisecondsTillNofity = millisecondsFromNow(firstNotificationTime);
    console.log("#firstNotificationTime: " + firstNotificationTime + "  millisecondsTillNofity: " + millisecondsTillNofity);
    // the timer is set once to alert us two hours before bath (invokes an event that is consumed by LU)
    console.log("#bath: " + JSON.stringify(bath))
    timer = setTimeout(_onFirstTimerExpired, millisecondsTillNofity, bath);
    //timer = setTimeout(_onFirstTimerExpired.bind(bath), millisecondsTillNofity); this approch did not work -> nath undefined
    // bind explained:  https://stackoverflow.com/questions/5520155/settimeout-callback-argument
}

//LU -> CALENDAR bath-deletion
exports.handleBathDeletion = function (deleteBath){
  const NOT_FOUND = -1
  function isDeleteBath(bath){
    // comparing time must be with getTime
    return bath.bathTime.getTime() == deleteBath.bathTime.getTime() && bath.userName == deleteBath.userName
  }
  IndexOfBath = baths.findIndex(isDeleteBath)
  console.log("calendar: index: " + IndexOfBath)
  if (IndexOfBath != NOT_FOUND){
    baths[IndexOfBath].status = "DELETED"
    baths.splice(IndexOfBath,1) // remove bath from array
    console.log("calendar: bath deleted successfuly: " + JSON.stringify(deleteBath))
    return "OK"
  }
  return "ELEMENT_NOT_FOUND"
}

// CALENDAR -> LU
exports.calendarResponse = function(){
  return baths;
}

function _emitEvent(bath){
  // console.log("emit timeBeforeBath " + JSON.stringify(bath));
  myEE.emit('timeBeforeBath', bath);
}

function _now(){
  return new Date()
}

function min2ms(time){
  return time*60*1000;
}

// validated
function millisecondsFromNow (futureDateTime){
  let future = new Date(futureDateTime)
  let now = new Date()
  console.log("calendar: millisecondsFromNow: futureDateTime: " + future.toUTCString() + " now " + now.toUTCString());
  let res = futureDateTime - now;  //time is ms from epoch
  if (res < 0 ){
    res = 0
    console.log("calendar: ERROR negative time chnged to zero")
    //throw "calendar: millisecondsTillNofity is negative. res =" + res;
  }
  return res;
}

// called when timer expire. emit an event to be read by the logical unit.
// if reached the bath time: possibly set a new timer for repeated bath
// if not reached the bath time: set for next notifyInterval
// create a repeated timer which will raise event
function _onFirstTimerExpired(bath) {
  if (bath.status == "DELETED"){
      console.log("first timeout with deleted bath.. not doing anything")
      // we do not creat a second timer..
      return
  }
  console.log("first timeout. will raise evet every: " + notifyInterval + " minutes. bath: "+ JSON.stringify(bath));
  _emitEvent(bath)

  // raise an event
  // see if we can cancel the timer (in case bathTime arrive)
  // if repeated need to change bath time and setup a single timer..
  let timer = setInterval(function(){
    //anonimous function previously _onRepeatedTimerExpired
    // console.log("~calendar: _onRepeatedTimerExpired() timed out !! " + JSON.stringify(bath));

    if (bath.status == "DELETED"){
        console.log("repeated timer with deleted bath.. clearing timer")
        clearInterval(timer)
        return
    }
    _emitEvent(bath)

    // if bath time arrived
    if (bath.bathTime < _now()){
      console.log("bathTime arrived. refreshing repeated if exist");
      clearInterval(timer)
      if (bath.repeatType == "DAILY"){
        // set next bathTime
        // create a firstTimer.
        bath.bathTime.addHours(24)
        console.log("+1day: " + bath.bathTime);
        exports.handleNewBath(bath)  //using a local function
      }
      else if (bath.repeatType == "WEEKLY"){
        bath.bathTime.addHours(24*7)
        console.log("+1week: " + bath.bathTime);
        exports.handleNewBath(bath)
      }
    }
    // console.log("_onRepeatedTimerExpired anonimous -->exit");
  }, min2ms(notifyInterval));
}

function _firstNotificationTime (bathTime){
  // First notification time is: (bathTime - timeBeforeBath) or now if we have less than two hours
  //let t = new Date(bathTime)
  let notifyTime = new Date(bathTime)
  notifyTime.setMinutes(notifyTime.getMinutes() - timeBeforeBath) //t.addMin(-timeBeforeBath);
  let now = _now();
  console.log("Calendar:_firstNotificationTime \nbathTime:"  + bathTime +
  ". \ntimeBeforeBath: " + timeBeforeBath +
  ". \nnotifyTime: " + notifyTime +
  ". \nnow: " + now)
  if (now > notifyTime){
    console.log("using now");
    return now;
  }
  console.log("using notifyTime");
  return  notifyTime;
}
