const baseTemplate = "config.js";
const currentConfig = "currentConfig.js"

var fs = require('fs');
var gekkoConfig = require("./" + baseTemplate);
var fuzzerConfig = require("./fuzzerConfig.json"); 
var childProcess = require('child_process');

var backtestResults = [];

function GenerateNumberRange(start, end, precision)
{
  var numArr = [];
  var currentAmount = start;
  var incrementAmount = 1;

  for(var i = 0; i < precision; i++)
  {
    incrementAmount = incrementAmount * .1;
  }

  while(currentAmount <= end)
  {
    numArr.push(currentAmount);
    currentAmount = currentAmount + incrementAmount;
  }

  return numArr;
}

var nums = GenerateNumberRange(0, .5, 3);

//setting the date range
gekkoConfig.backtest.daterange.from = fuzzerConfig.StartTime;
gekkoConfig.backtest.daterange.to = fuzzerConfig.EndTime;

for(var i = 0; i < nums.length; i++)
{

  //DEMA config
  gekkoConfig.DEMA.thresholds.down = -1 * nums[i];
console.log(gekkoConfig.DEMA.thresholds.down);
  let fileText = "var config = " + JSON.stringify(gekkoConfig) + "\nmodule.exports = config;";

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
}
//console.log(output.indexOf("(PROFIT REPORT)"));
