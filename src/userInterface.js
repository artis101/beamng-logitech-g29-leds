const chalk = require("chalk");
const figlet = require("figlet");
// const cliProgress = require("cli-progress");

function logInfo(message) {
  console.log(chalk.cyan(message));
}

function logWarning(message) {
  console.log(chalk.yellow(message));
}

function logError(...messages) {
  console.error(chalk.red(...messages));
}

function logCriticalError(...messages) {
  logError(...messages);
  process.exit(1);
}

function logFeedback(message) {
  console.log(chalk.green(message));
}

function setupUI() {
  console.log(chalk.yellow(figlet.textSync("BeamNG + G29", { horizontalLayout: "full" })));

  console.log(
    chalk.cyan(`
[INFO] Logitech G29 & BeamNG.drive utility\n
This utility connects your Logitech G29 steering wheel's LED's\nwith BeamNG.drive game by reading the car's RPM data.
  `)
  );
}

let gasPedalProgressBar;
let brakePedalProgressBar;
let clutchPedalProgressBar;

function createProgressBars() {
  // Create progress bars for pedals
  // logFeedback("\nGas Pedal:");
  // gasPedalProgressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  // gasPedalProgressBar.start(100, 0);
  // logFeedback("\nBrake Pedal:");
  // brakePedalProgressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  // brakePedalProgressBar.start(100, 0);
  // logFeedback("\nClutch Pedal:");
  // clutchPedalProgressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  // clutchPedalProgressBar.start(100, 0);
}

function updateProgressBar(progressBar, value) {
  // progressBar.update(value);
}

function updateGasPedalProgressBar(value) {
  updateProgressBar(gasPedalProgressBar, value);
}

function updateBrakePedalProgressBar(value) {
  updateProgressBar(brakePedalProgressBar, value);
}

function updateClutchPedalProgressBar(value) {
  updateProgressBar(clutchPedalProgressBar, value);
}

module.exports = {
  logInfo,
  logWarning,
  logError,
  logCriticalError,
  logFeedback,
  setupUI,
  createProgressBars,
  updateGasPedalProgressBar,
  updateBrakePedalProgressBar,
  updateClutchPedalProgressBar,
};
