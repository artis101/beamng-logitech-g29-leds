// beamng outgauge port
const PORT = 4444;
// beamng outgauge address
const ADDRESS = "127.0.0.1";
// default max rpm setting
const DEFAULT_MAX_RPM = 7000;
// default flash interval is to blink five times a second.
// value expressed in half cycles per second
const DEFAULT_FLASH_INTERVAL = 100;
// default blink threshold is 90% of maxrpm
const DEFAULT_BLINK_THRESHOLD = 0.9;

module.exports = {
  PORT,
  ADDRESS,
  DEFAULT_MAX_RPM,
  DEFAULT_FLASH_INTERVAL,
  DEFAULT_BLINK_THRESHOLD,
};
