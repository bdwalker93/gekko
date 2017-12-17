const baseTemplate = "config.js";
const currentConfig = "currentConfig.js"

var fs = require('fs');
var config = require("./" + baseTemplate);
var exec = require('child_process').exec;

//setting the date range
config.backtest.daterange.from = "2017-09-11";
config.backtest.daterange.to = "2017-09-12";

//DEMA config
config.DEMA.thresholds.down = -10;

let fileText = "var config = " + JSON.stringify(config) + "\nmodule.exports = config;";

//Writing it back to file
fs.writeFileSync('./' + currentConfig, fileText, 'utf-8'); 

//Now need to kick off gekko
var child = exec('node gekko.js --backtest --config ' + currentConfig);

child.stdout.on('data', function(data) {
  console.log(data);
});

child.on('close', function() {
  console.log('***Backtest Done****');
});


