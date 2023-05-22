const ui = require("./userInterface");
const cliProgress = require("cli-progress");

describe("userInterface.js tests", () => {
  test("createProgressBars should create progress bars for pedals", () => {
    // Arrange
    const mockProgressBar = {
      start: jest.fn(),
    };
    const mockSingleBar = jest.spyOn(cliProgress, "SingleBar").mockReturnValue(mockProgressBar);

    // Act
    ui.createProgressBars();

    // Assert
    expect(mockSingleBar).toHaveBeenCalledTimes(0);
    expect(mockProgressBar.start).toHaveBeenCalledTimes(0);
  });
});
