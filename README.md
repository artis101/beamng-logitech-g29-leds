# 🏎️ Logitech G29 & BeamNG.drive Utility 🕹️

Hi there! 👋 This is a utility designed and developed to connect your Logitech G29 steering wheel's LEDs with the BeamNG.drive game by reading the car's RPM data in real-time. Pretty cool, right? 🚀

## 🎯 What does it do?

This utility makes your gaming experience more immersive by syncing your Logitech G29's LED indicators with your in-game vehicle's RPM data. As you rev up your car in the game, the LED indicators on your steering wheel will react accordingly.

Before BeamNG.drive is connected, the utility is in the test mode where the LEDs respond to the gas pedal.

Once the game is connected, it switches to the game mode where the LEDs respond to the car's RPM in the game.

You can enter the Max RPM of the car you're using at any time by typing the number of RPM in and pressing Enter. The default is 7000 RPM.

## 🛠️ Main Dependencies

1. **Node.js:** The utility is built with Node.js, a JavaScript runtime built on Chrome's V8 JavaScript engine.
2. **logitech-g29:** This Node.js module allows us to interface with the Logitech G29 steering wheel.
3. **dgram:** This is a Node.js module that provides an implementation of UDP Datagram sockets.

## 💻 How to use it?

Before starting, ensure that you have Node.js installed. If not, you can download it from [here](https://nodejs.org/en/download/).

Clone the repository:

```bash
git clone https://github.com/artis101/beamng-logitech-g29-leds
```

Install the dependencies:

```bash
cd beamng-logitech-g29-leds
yarn install
```

Run the utility:

```bash
node main.js
```

Use Ctrl-C to exit the program.

That's it! Enjoy your immersive gaming experience. 🎮

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check issues page.

## 📄 License

This project is MIT licensed.

## 🧔 Author

Artis

Happy gaming! 🥳
