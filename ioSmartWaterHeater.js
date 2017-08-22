const fs = require('fs');
// reference: https://docs.nodejitsu.com/articles/file-system/how-to-read-files-in-nodejs/
// fs.readFile(filePath, callback) is async readFile
// we need sync readFile since the calculation is depending on an answer
exports.writeVal = (filePath, val) => {
  fs.writeFile(filePath, val)
  console.log("writing to " + filePath + " val " + val);
}


exports.readFile = (filePath) => {
  let fd = fs.openSync(filePath,'r');
  let buffer = new Buffer(77)
  let data = fs.readSync(fd,buffer,0,buffer.length,0);
  fs.closeSync(fd)
  return buffer;
}


// exports.readFile = (filePath, callback) => {
//   fs.readFile(filePath, (err, data) => {
//   if (err) throw err;
//   callback(data);
//   // cant use return of callback because readFile isnt invok
// });
// }
