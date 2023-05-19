const {
  calculateRpmFraction,
  isValidRpmFraction,
  parseRpmFromMessage,
} = require("./app");

describe("calculateRpmFraction", () => {
  it("should calculate fraction correctly", () => {
    expect(calculateRpmFraction(3500, 7000)).toBe(0.5);
  });
});

describe("isValidRpmFraction", () => {
  it("should validate fractions correctly", () => {
    expect(isValidRpmFraction(0.5)).toBe(true);
    expect(isValidRpmFraction(1.5)).toBe(false);
    expect(isValidRpmFraction(-0.5)).toBe(false);
  });
});

describe("parseRpmFromMessage", () => {
  it("should parse RPM correctly from message", () => {
    const rpm = 3500.0;
    const buffer = Buffer.alloc(4);
    buffer.writeFloatLE(rpm, 0);
    const msg = Buffer.concat([Buffer.alloc(16), buffer]); // add 16 leading zeros

    expect(parseRpmFromMessage(msg)).toBe(rpm);
  });
});
