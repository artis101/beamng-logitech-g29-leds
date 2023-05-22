const dgram = require("dgram");
const logitech = require("logitech-g29");
const { runApp, handleUserInput } = require("./app");
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
    runApp({ port, address });

    // Assert
    expect(dgram.createSocket).toHaveBeenCalledWith("udp4");
    expect(mockSocket.bind).toHaveBeenCalledWith(port, address);
  });

  test("parseUDPMessage should handle RPM fractions < blinkThreshold", () => {
    // Arrange
    const port = 4444;
    const address = "127.0.0.1";
    const mockMessage = createMockMessage(3500.0); // 50% of 7000 RPM
    const blinkThreshold = 0.9;
    const flashInterval = 500;

    // Act
    runApp({ port, address, maxRpm: 7000, blinkThreshold, flashInterval });

    // Get the callback function passed to 'on' and invoke it with the mockMessage
    const callback = mockSocket.on.mock.calls[0][1];
    callback(mockMessage, 7000);

    // Assert
    expect(logitech.leds).toHaveBeenCalledWith(0.5);
  });

  test("parseUDPMessage should handle RPM fractions >= blinkThreshold but < 1", () => {
    // Arrange
    const port = 4444;
    const address = "127.0.0.1";
    const mockMessage = createMockMessage(6370.0); // 91% of 7000 RPM
    const blinkThreshold = 0.9;
    const flashInterval = 500;

    // Act
    runApp({ port, address, maxRpm: 7000, blinkThreshold, flashInterval });

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
    const blinkThreshold = 0.9;
    const flashInterval = 500;

    // Act
    runApp({ port, address, maxRpm: 7000, blinkThreshold, flashInterval });

    // Get the callback function passed to 'on' and invoke it with the mockMessage
    const callback = mockSocket.on.mock.calls[0][1];
    callback(mockMessage, 7000);

    // Assert
    expect(logitech.leds).toHaveBeenCalledWith(expect.any(Number)); // flashState (1 or 0)
  });

  test("parseUDPMessage should handle RPM fractions >= blinkThreshold with custom blinkThreshold", () => {
    // Arrange
    const port = 4444;
    const address = "127.0.0.1";
    const mockMessage = createMockMessage(6300.0); // 90% of 7000 RPM
    const blinkThreshold = 0.8;
    const flashInterval = 500;

    // Act
    runApp({ port, address, maxRpm: 7000, blinkThreshold, flashInterval });

    // Get the callback function passed to 'on' and invoke it with the mockMessage
    const callback = mockSocket.on.mock.calls[0][1];
    callback(mockMessage, 7000);

    // Assert
    expect(logitech.leds).toHaveBeenCalledWith(1);
  });

  test("parseUDPMessage should handle RPM fractions >= 1 with custom flashInterval", () => {
    // Arrange
    const port = 4444;
    const address = "127.0.0.1";
    const mockMessage = createMockMessage(7070.0); // 101% of 7000 RPM
    const blinkThreshold = 0.9;
    const flashInterval = 100;

    // Act
    runApp({ port, address, maxRpm: 7000, blinkThreshold, flashInterval });

    // Get the callback function passed to 'on' and invoke it with the mockMessage
    const callback = mockSocket.on.mock.calls[0][1];
    callback(mockMessage, 7000);

    // Assert
    expect(logitech.leds).toHaveBeenCalledWith(expect.any(Number)); // flashState (1 or 0)
  });

  describe("handleUserInput tests", () => {
    test("should update max RPM when user inputs a new value", () => {
      // Arrange
      const mockLogInfo = jest.fn();
      const mockLogWarning = jest.fn();
      const mockHandleTestMode = jest.fn();
      const mockCleanupAndExit = jest.fn();
      const currentMaxRpm = 7000;
      const newMaxRpm = 8000;

      // Act
      const updatedMaxRpm = handleUserInput(
        newMaxRpm.toString(),
        currentMaxRpm,
        mockLogInfo,
        mockLogWarning,
        mockHandleTestMode,
        mockCleanupAndExit
      );

      // Assert
      expect(updatedMaxRpm).toBe(newMaxRpm);
      expect(mockLogInfo).toHaveBeenCalledWith(`\n[INFO] The Max RPM is now ${newMaxRpm}`);
    });

    test("should handle invalid input and log a warning", () => {
      // Arrange
      const mockLogInfo = jest.fn();
      const mockLogWarning = jest.fn();
      const mockHandleTestMode = jest.fn();
      const mockCleanupAndExit = jest.fn();
      const currentMaxRpm = 7000;
      const invalidInput = "invalid";

      // Act
      const updatedMaxRpm = handleUserInput(
        invalidInput,
        currentMaxRpm,
        mockLogInfo,
        mockLogWarning,
        mockHandleTestMode,
        mockCleanupAndExit
      );

      // Assert
      expect(updatedMaxRpm).toBe(currentMaxRpm);
      expect(mockLogWarning).toHaveBeenCalledWith("\n[WARN] Invalid input, please enter a number or a command");
    });

    test("should handle 'test' command and call handleTestMode", () => {
      // Arrange
      const mockLogInfo = jest.fn();
      const mockLogWarning = jest.fn();
      const mockHandleTestMode = jest.fn();
      const mockCleanupAndExit = jest.fn();
      const currentMaxRpm = 7000;
      const testCommand = "test";

      // Act
      const updatedMaxRpm = handleUserInput(
        testCommand,
        currentMaxRpm,
        mockLogInfo,
        mockLogWarning,
        mockHandleTestMode,
        mockCleanupAndExit
      );

      // Assert
      expect(updatedMaxRpm).toBe(currentMaxRpm);
      expect(mockHandleTestMode).toHaveBeenCalled();
    });

    test("should handle 'exit' command and call cleanupAndExit", () => {
      // Arrange
      const mockLogInfo = jest.fn();
      const mockLogWarning = jest.fn();
      const mockHandleTestMode = jest.fn();
      const mockCleanupAndExit = jest.fn();
      const currentMaxRpm = 7000;
      const exitCommand = "exit";

      // Act
      const updatedMaxRpm = handleUserInput(
        exitCommand,
        currentMaxRpm,
        mockLogInfo,
        mockLogWarning,
        mockHandleTestMode,
        mockCleanupAndExit
      );

      // Assert
      expect(updatedMaxRpm).toBe(currentMaxRpm);
      expect(mockCleanupAndExit).toHaveBeenCalled();
    });
  });
});
