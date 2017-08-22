// Load modules

const Hapi = require('hapi');
let dbService = require('./dbService')  //TODO handle all in LU..
let LU = require('./logicalUnit')

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
    port: 80
});
//*************************************************
//path:'/login',
//path:'/view-calendar-request',
//path:'/bath-schedule',
//path:'/bath-deletion',
//path:'/calendar-request',
//path:'/get-temperature',
//path:'/water-heater-was-on-per-bath',
//path:'/water-heater-was-on-per-bath',
//path:'/settings',
//path:'/water-heater-was-on',
//path:'/feedback',
//path:'/feedback-statistics',
//path:'/number-of-baths',
//*************************************************
// Add the route

server.route({
  method:'POST',
  path:'/login',
  handler: (request, reply) => {
    let ip = request.payload.ip;             // user ip
    let userName = request.payload.userName; // some string
    let login = {
        ip: ip,
        userName: userName
    }
    console.log("index: /login params:" + JSON.stringify(login));
    reply(LU.handleLogin(login))
  }
});

server.route({
  method:'GET',
  path:'/view-calendar-request',
  handler: (request, reply) => {
    console.log("index: /view-calendar-request");
    reply(LU.handleViewCalendarRequest());
  }
});

// can return "INVALID_HEAT_LEVEL"  or "INVALID_REPEAT_TYPE"
// " bath is in the past. ignoring request" or "OK"
server.route({
  method:'POST',
  path:'/bath-schedule',
  handler: (request, reply) => {
    console.log("index: /bath-schedule");
    try {
      let bath = {
        bathTime: new Date(parseInt(request.payload.bathTime)),
        userName: request.payload.userName,
        heatLevel: request.payload.heatLevel,     //HOT, SEMI, COLD
        repeatType: request.payload.repeatType}   //DAILY, WEEKLY, NONE
      console.log("with params: " + JSON.stringify(bath));
      reply(LU.handleBathSchedule(bath));
    } catch(e) {
      reply(e).code(500);
    }
  }
});

// can return "OK" or "ELEMENT_NOT_FOUND"
server.route({
  method:'POST',
  path:'/bath-deletion',
  handler: (request, reply) => {
  try{
    let bathTime = new Date(parseInt(request.payload.bathTime));
    let userName = request.payload.userName;
    let deleteBath = {
        bathTime: bathTime,
        userName: userName
    }
    reply(LU.handleBathDeletion(deleteBath))
  } catch(e) {
    reply(e).code(500);
  }
  }
});

server.route({
  method:'GET',
  path:'/calendar-request',
  handler: (request, reply) => {
    reply(LU.handleViewCalendarRequest())
  }
});
//////////////////////////////////////////////////////
//////////////////// REPORTS /////////////////////////
server.route({
  method:'GET',
  path:'/get-temperature',
  handler: (request, reply) => {
    reply(LU.getTemperature())
  }
});

server.route({
  method:'GET',
  path:'/water-heater-was-on-per-bath',
  handler: (request, reply) => {
    reply(dbService.getAllWaterHeaterOnPerBath())
  }
});

server.route({
  method:'GET',
  path:'/water-heater-was-on',
  handler: (request, reply) => {
    reply(dbService.getAllWaterHeaterOnPerBath())
  }
});

server.route({
  method:'GET',
  path:'/number-of-baths',
  handler: (request, reply) => {
    reply(dbService.getAllWaterHeaterOnPerBath())
  }
});

server.route({
  method:'GET',
  path:'/feedback-statistics',
  handler: (request, reply) => {
    reply(LU.getFeedback())
  }
});

//new feedback
// can return "INVALID_FEEDBACK" or "OK"
server.route({
  method:'POST',
  path:'/feedback',
  handler: (request, reply) => {
  try{
    let bathFeedback = {
        bathTime: new Date(parseInt(request.payload.bathTime)),
        userName: request.payload.userName,
        feedback: request.payload.feedback //"too hot", "too cold", "just right"
    }
    reply(LU.newFeedback(bathFeedback))
  } catch(e) {
    reply(e).code(500);
  }
  }
});

server.route({
  method:'POST',
  path:'/settings',
  handler: (request, reply) => {
    try{
    let waterHeaterParams = {"volume":request.payload.volume,
                             "kwatt":request.payload.kwatt}
    reply(dbService.setWaterHeaterParams(waterHeaterParams))
  } catch(e) {
    reply(e).code(500);
  }
  }
});

server.route({
  method:'GET',
  path:'/settings',
  handler: (request, reply) => {
    try{
    reply(dbService.getWaterHeaterParams())
  } catch(e) {
    reply(e).code(500);
  }
  }
});

// to delete
server.route({
  method:'POST',
  path:'/water-heater-was-on-per-bath',
  handler: (request, reply) => {
    console.log(request.payload);
    try {
      let time = new Date(request.payload.time);
      let amount = request.payload.amount;

      let newRecord = {
        time: time,
        amount: amount
      }
      dbService.WaterHeaterOnPerBathSave(newRecord);
      return reply('OK');
    } catch(e) {
      reply(e).code(500);
    }
  }
});


//////////////////////////////////////////////////////

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
