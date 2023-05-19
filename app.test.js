const dgram = require("dgram");
const logitech = require("logitech-g29");
const { runApp } = require("./app");

jest.mock("dgram");
jest.mock("logitech-g29");
jest.mock("./utils");
jest.mock("./userInterface");
jest.mock("./state", () => ({
  isConnectedToWheel: jest.fn(() => true),
  inTestMode: jest.fn(() => true),
  socket: jest.fn(() => undefined),
}));

describe("app.js tests", () => {
  let mockSocket;
  let mockLogitech;

  beforeEach(() => {
    mockSocket = {
      bind: jest.fn(),
      on: jest.fn(),
      close: jest.fn(),
      _handle: {},
    };

    mockLogitech = {
      connect: jest.fn(),
      on: jest.fn(),
      leds: jest.fn(),
      disconnect: jest.fn(),
    };

    dgram.createSocket.mockReturnValue(mockSocket);

    global.logitech = mockLogitech;
  });

  afterEach(() => {
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

  test("cleanupAndExit should close connection to wheel when connected", () => {
    // Act
    process.emit("SIGINT");
    process.emit("SIGTERM");

    // Assert
    expect(logitech.disconnect).toHaveBeenCalled();
  });
});
