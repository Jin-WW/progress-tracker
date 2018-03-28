const config = require('./config.json');
const location = config.STORAGE_LOCATION;
const path = require('path');
const fs = require('fs');

function name(key){
  return path.join(__dirname, location, key);
}

function get(key){
  const file = name(key);
  if(fs.existsSync(file)){
    return JSON.parse(fs.readFileSync(file));
  }
  return null;
}

function set(key, value){
  const file = name(key);
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

module.exports = {
  get,
  set
};