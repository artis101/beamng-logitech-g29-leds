const { createMockMessage } = require("./testUtils");

describe("createMockMessage tests", () => {
  test("It should return a buffer of the correct length", () => {
    const rpm = 7000;
    const result = createMockMessage(rpm);
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBe(20);
  });

  test("It should correctly encode the rpm value", () => {
    const rpm = 7000;
    const result = createMockMessage(rpm);
    const rpmFromBuffer = result.readFloatLE(16); // read rpm from the offset of 16
    expect(rpmFromBuffer).toBe(rpm);
  });

  test("It should handle edge cases", () => {
    const maxFloat = Number.MAX_VALUE;
    const result = createMockMessage(maxFloat);
    const rpmFromBuffer = result.readFloatLE(16);
    expect(rpmFromBuffer).toBe(Infinity);

    const minFloat = Number.MIN_VALUE;
    const result2 = createMockMessage(minFloat);
    const rpmFromBuffer2 = result2.readFloatLE(16);
    expect(rpmFromBuffer2).toBe(0);
  });
});
