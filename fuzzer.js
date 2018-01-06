const baseTemplate = "config.js";
const currentConfig = "currentConfig.js"

var fs = require('fs');
var gekkoConfig = require("./" + baseTemplate);
var fuzzerConfig = require("./fuzzerConfig.json"); 
var childProcess = require('child_process');

var backtestResults = [];

function GenerateNumberRange(configAr)
{
  var numArr = [];
  var currentAmount = configAr[0];
  var end = configAr[1];
  var incrementAmount = configAr[2];

  while(currentAmount <= end)
  {
    numArr.push(currentAmount);
    currentAmount = currentAmount + incrementAmount;
  }

  return numArr;
}


function ExecuteBackTest(up, down)
{
  //DEMA config
  gekkoConfig.DEMA.thresholds.down = down;
  gekkoConfig.DEMA.thresholds.up = up;
  //console.log(gekkoConfig.DEMA.thresholds.down);
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
//console.log(output.indexOf("(PROFIT REPORT)"));
}

//setting the date range
gekkoConfig.backtest.daterange.from = fuzzerConfig.StartTime;
gekkoConfig.backtest.daterange.to = fuzzerConfig.EndTime;

var up = GenerateNumberRange(fuzzerConfig.StratConfig[0].$.DEMA.threshold.up);
var down = GenerateNumberRange(fuzzerConfig.StratConfig[0].$.DEMA.threshold.down);
for(var u = 0; u < up.length; u++)
{
  for(var d = 0; d < down.length; d++)
  {
    ExecuteBacktest(up[u], down[d]);
  }
}
