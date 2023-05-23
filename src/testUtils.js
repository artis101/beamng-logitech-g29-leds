const createMockMessage = (rpm) => {
  const buffer = Buffer.alloc(4);
  buffer.writeFloatLE(rpm, 0);
  const mockMessage = Buffer.concat([Buffer.alloc(16), buffer]); // add 16 leading zeros

  return mockMessage;
};

module.exports = {
  createMockMessage,
};
