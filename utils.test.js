const { parseRpmFromMessage, calculateRpmFraction, isValidRpmFraction } = require("./utils");

describe("utils.js tests", () => {
  test("parseRpmFromMessage should correctly extract and convert RPM from the message", () => {
    const rpm = 1234.5678;
    const buffer = Buffer.alloc(4);
    buffer.writeFloatLE(rpm, 0);
    const msg = Buffer.concat([Buffer.alloc(16), buffer]); // add 16 leading zeros
    expect(rpm).toBeCloseTo(rpm);
  });

  test("calculateRpmFraction should correctly calculate RPM fraction", () => {
    expect(calculateRpmFraction(3500, 7000)).toBe(0.5);
    expect(calculateRpmFraction(0, 7000)).toBe(0);
    expect(calculateRpmFraction(7000, 7000)).toBe(1);
  });

  test("isValidRpmFraction should correctly validate RPM fraction", () => {
    expect(isValidRpmFraction(0)).toBe(true);
    expect(isValidRpmFraction(0.5)).toBe(true);
    expect(isValidRpmFraction(1)).toBe(true);
    expect(isValidRpmFraction(-0.1)).toBe(false);
    expect(isValidRpmFraction(1.1)).toBe(false);
  });
});
