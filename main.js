const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const pkg = require("./package.json");
const { runApp } = require("./app");
const { PORT, ADDRESS, DEFAULT_MAX_RPM } = require("./config");

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
    maxRpm: argv.maxRpm || DEFAULT_MAX_RPM,
    verbose: argv.verbose,
  };
}

runApp(handleCliParams());
