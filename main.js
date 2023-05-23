const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const pkg = require("./package.json");
const { runApp } = require("./src/app");
const { PORT, ADDRESS, DEFAULT_MAX_RPM, DEFAULT_FLASH_INTERVAL, DEFAULT_BLINK_THRESHOLD } = require("./src/config");

function handleCliParams() {
  const argv = yargs(hideBin(process.argv))
    .usage("Usage: $0 [options]")
    .option("port", {
      alias: "p",
      describe: `The port to listen for BeamNG.drive messages on. Default: ${PORT}`,
      type: "number",
    })
    .option("address", {
      describe: `The address to listen for BeamNG.drive messages on. Default: ${ADDRESS}`,
    })
    .option("max-rpm", {
      describe: `The maximum RPM of the car you are using. Default: ${DEFAULT_MAX_RPM}`,
      type: "number",
    })
    .option("verbose", {
      describe: "Show verbose output",
      type: "boolean",
    })
    .option("flash-interval", {
      describe: "The interval (in milliseconds) between flashes. Default: 500",
      type: "number",
      default: DEFAULT_FLASH_INTERVAL,
    })
    .option("blink-threshold", {
      describe: "The RPM fraction above which the LEDs should blink. Default: 0.9",
      type: "number",
      default: DEFAULT_BLINK_THRESHOLD,
    })
    .version(pkg.version)
    .help()
    .alias("version", "v")
    .alias("help", "h").epilogue(`
You can find the source code for this project at:
https://github.com/artis101/beamng-logitech-g29-leds
`).argv;

  return {
    port: argv.port || PORT,
    address: argv.address || ADDRESS,
    flashInterval: argv["flash-interval"] || DEFAULT_FLASH_INTERVAL,
    maxRpm: argv["max-rpm"] || DEFAULT_MAX_RPM,
    verbose: argv.verbose || false,
    blinkThreshold: argv["blink-threshold"] || DEFAULT_BLINK_THRESHOLD,
  };
}

runApp(handleCliParams());
