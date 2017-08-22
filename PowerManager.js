// Load modules
const dbService = require('./dbService');
const fileIO = require('./ioSmartWaterHeater')
// consts
const OFF = "off"
const ON = "on"
const filePath = "/sys/class/gpio/gpio27/value";
let state = OFF;

function _setState(mode){
  state = mode;
  dbService.newPowerOperation({dateTime : new Date, mode : mode});
  HW_set_state(mode)
}

function HW_set_state(mode){
  val = (mode == ON)? 1 : 0
  fileIO.writeVal("myPowerFile.txt", val)
}
exports.switchOn = () => {
  if (state == OFF){
    _setState(ON)
  }
}

exports.switchOff = () => {
  if (state == ON){
    _setState(OFF)
  }
}

// returns "on" or "off"
exports.getState = () => {
  return state
}
