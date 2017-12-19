const baseTemplate = "config.js";
const currentConfig = "currentConfig.js"

var fs = require('fs');
var config = require("./" + baseTemplate);
var childProcess = require('child_process');

var backtestResults = [];

//setting the date range
config.backtest.daterange.from = "2017-09-11";
config.backtest.daterange.to = "2017-09-12";

//DEMA config
config.DEMA.thresholds.down = -.01;

let fileText = "var config = " + JSON.stringify(config) + "\nmodule.exports = config;";

//Writing it back to file
fs.writeFileSync('./' + currentConfig, fileText, 'utf-8'); 

//Kicking off GEKKO (We need to use "spawn" and not "exec" to get full output)
var spawn = childProcess.spawnSync;
var child = spawn('node', ['gekko.js', '--backtest', '--config', currentConfig], {
  shell: true
});

var output = child.output.toString("utf8");

backtestResults.push({
  "output": output.substring(output.indexOf("(ROUNDTRIP) REPORT:"), output.length)
});

var indexOfProfit = output.indexOf("(PROFIT REPORT) simulated profit:");
var endOfProfit =  output.indexOf("\n", indexOfProfit);
console.log(output.substring(indexOfProfit, endOfProfit));
//console.log(output.indexOf("(PROFIT REPORT)"));
