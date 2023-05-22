const dgram = require("dgram");
const logitech = require("logitech-g29");
const { runApp } = require("./app");
const { createMockMessage } = require("./testUtils");

jest.mock("dgram");
jest.mock("readline", () => ({
  createInterface: jest.fn(() => ({
    on: jest.fn(() => jest.fn()),
  })),
}));
jest.mock("logitech-g29", () => ({
  connect: jest.fn(),
  on: jest.fn(),
  leds: jest.fn(),
  disconnect: jest.fn(),
}));
jest.mock("./userInterface");

describe("app.js tests", () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      bind: jest.fn(),
      on: jest.fn(),
      close: jest.fn(),
      _handle: {},
    };

    dgram.createSocket.mockReturnValue(mockSocket);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  test("createAndBindSocket should create and bind a UDP socket", () => {
    // Arrange
    const port = 4444;
    const address = "127.0.0.1";

    // Act
    runApp({ port, address, maxRpm: 7000 });

    // Assert
    expect(dgram.createSocket).toHaveBeenCalledWith("udp4");
    expect(mockSocket.bind).toHaveBeenCalledWith(port, address);
  });

  test("connectToLogitechG29 should connect to the Logitech G29", () => {
    // Arrange
    const port = 4444;
    const address = "127.0.0.1";

    // Act
    runApp({ port, address, maxRpm: 7000 });

    // Assert
    expect(logitech.connect).toHaveBeenCalled();
  });

  test("handleTestMode should handle test mode for pedals", () => {
    // Arrange
    const port = 4444;
    const address = "127.0.0.1";

    // Act
    runApp({ port, address, maxRpm: 7000 });

    // Assert
    expect(logitech.on).toHaveBeenCalledWith("pedals-gas", expect.any(Function));
    expect(logitech.on).toHaveBeenCalledWith("pedals-brake", expect.any(Function));
    expect(logitech.on).toHaveBeenCalledWith("pedals-clutch", expect.any(Function));
  });

  test("handleMessage should handle messages from the UDP socket", () => {
    // Arrange
    const port = 4444;
    const address = "127.0.0.1";

    // Act
    runApp({ port, address, maxRpm: 7000 });

    // Assert
    expect(mockSocket.on).toHaveBeenCalledWith("message", expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith("error", expect.any(Function));
  });

  test("cleanupAndExit should disconnect from the Logitech G29 and close the UDP socket", () => {
    // Arrange
    const port = 4444;
    const address = "127.0.0.1";

    // this will force the app into thinking it's connected to the wheel
    logitech.connect.mockImplementationOnce((cb) => cb(undefined)); // no error

    // Act
    runApp({ port, address, maxRpm: 7000 });

    const mockMessage = createMockMessage(850);
    // Get the callback function passed to 'on' and invoke it with the mockMessage
    const callback = mockSocket.on.mock.calls[0][1];
    callback(mockMessage, 7000);

    process.emit("SIGINT");

    // Assert
    expect(logitech.disconnect).toHaveBeenCalled();
    expect(mockSocket.close).toHaveBeenCalled();
  });

  test("parseUDPMessage should handle valid RPM fractions", () => {
    // Arrange
    const port = 4444;
    const address = "127.0.0.1";
    const maxRpm = 7000;

    const mockMessage = createMockMessage(5250.0);

    // Act
    runApp({ port, address, maxRpm });

    // Get the callback function passed to 'on' and invoke it with the mockMessage
    const callback = mockSocket.on.mock.calls[0][1];
    callback(mockMessage, maxRpm);

    // Assert
    expect(logitech.leds).toHaveBeenCalledWith(0.75);
  });

  test("parseUDPMessage should handle invalid RPM fractions", () => {
    // Arrange
    const port = 4444;
    const address = "127.0.0.1";

    const mockMessage = createMockMessage(-5250.0);

    // Act
    runApp({ port, address, maxRpm: 7000 });

    // Get the callback function passed to 'on' and invoke it with the mockMessage
    const callback = mockSocket.on.mock.calls[0][1];
    callback(mockMessage, 7000);

    // Assert
    expect(logitech.leds).toHaveBeenCalledWith(expect.any(Number));
  });

  test("parseUDPMessage should handle RPM fractions >= 0.9 but < 1", () => {
    // Arrange
    const port = 4444;
    const address = "127.0.0.1";
    const mockMessage = createMockMessage(6370.0); // 91% of 7000 RPM

    // Act
    runApp({ port, address, maxRpm: 7000 });

    // Get the callback function passed to 'on' and invoke it with the mockMessage
    const callback = mockSocket.on.mock.calls[0][1];
    callback(mockMessage, 7000);

    // Assert
    expect(logitech.leds).toHaveBeenCalledWith(1);
  });

  test("parseUDPMessage should handle RPM fractions >= 1", () => {
    // Arrange
    const port = 4444;
    const address = "127.0.0.1";
    const mockMessage = createMockMessage(7070.0); // 101% of 7000 RPM

    // Act
    runApp({ port, address, maxRpm: 7000 });

    // Get the callback function passed to 'on' and invoke it with the mockMessage
    const callback = mockSocket.on.mock.calls[0][1];
    callback(mockMessage, 7000);

    // Assert
    expect(logitech.leds).toHaveBeenCalledWith(expect.any(Number)); // flashState (1 or 0)
  });
});
