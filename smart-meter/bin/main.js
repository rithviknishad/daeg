require("dotenv").config();

const mqtt = require("mqtt");
const chalk = require("chalk");

/**
 * The logger to be used.
 */
const logger = eval(process.env.LOGGER || "console.log");
const fmtMsg = (msg) => `[${new Date().toISOString()}] ${msg}`;
const log = (msg) => logger(fmtMsg(msg));
const trace = (msg) => logger(chalk.gray(fmtMsg(msg)));
const warn = (msg) => logger(chalk.yellowBright(fmtMsg(msg)));
const error = (msg) => logger(chalk.redBright(fmtMsg(msg)));
const success = (msg) => logger(chalk.greenBright(fmtMsg(msg)));

/**
 * Vaidyuti Protocol Address assigned to the prosumer.
 */
const VP_ADDRESS = process.env.VP_ADDRESS || "no-vp-addr";
trace(`Starting prosumer with VP_ADDRESS=${VP_ADDRESS}`);

/**
 * The speed at which the prosumer meters clock should run.
 * Defaults to 1x.
 * Eg: `SIMULATION_SPEED=2` means the clock shall run two times faster than
 * real-world clock.
 * Note: this will affect the `UPDATE_INTERVAL`s effective value.
 */
const SIMULATION_SPEED = process.env.SIMULATION_SPEED || 1;
trace(`Simulation speed set to: ${SIMULATION_SPEED}x`);

/**
 * The interval at which contracts should be exchanged and communicated with
 * the associated Microgrid Energy Management System's API Server. Defaults to
 * 15 minutes.
 * Value should be in milliseconds.
 */
const UPDATE_INTERVAL =
  (process.env.UPDATE_INTERVAL || 900000) / SIMULATION_SPEED;
trace(
  `Contracts will be exchanged every ${
    UPDATE_INTERVAL / 1000
  } seconds (real world clock).`
);

/**
 * The resource link to where MQTT server of the MGEMS is hosted.
 */
const MGEMS_MQTT_URL = process.env.MGEMS_MQTT_URL || "mqtt://127.0.0.1";

/**
 * The MQTT Client ID of the prosumer.
 */
const MQTT_CLIENT_ID = `prosumer-${VP_ADDRESS}`;

/**
 * The MQTT username of the prosumer.
 * TODO: make topic based ACL authorization based on username.
 */
const MQTT_USERNAME = `${VP_ADDRESS}`;

/**
 * The MQTT password of the prosumer.
 * TODO: make topic based ACL authorization.
 */
const MQTT_PASSWORD = `${VP_ADDRESS}`;

// TODO: register prosumer to MGEMS server using HTTP POST
// TODO: gracefully terminate with exit code 1, if response != OK

log(`Connecting to ${MGEMS_MQTT_URL}`);
const client = mqtt.connect(MGEMS_MQTT_URL, {
  clientId: MQTT_CLIENT_ID,
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  // Volunatarily set to false to allow receiving QoS 1 and 2 messages when
  // offline.
  // TODO: imagine and render how this works in brain someday
  clean: false,
});

client
  .on("connect", () => {
    success(`Connected to ${MGEMS_MQTT_URL}`);
  })
  .on("disconnect", () => {
    error("MQTT Disconnected");
  })
  .on("close", () => {
    error("MQTT connection closed");
  })
  .on("end", () => {
    error("MQTT connection ended");
  });

function gracefullyExit() {
  logger("");
  warn("Prosumer Meter interrupted. Gracefully exiting...");
  client.end(false, {}, () => {
    process.exit();
  });
}

process.on("SIGINT", gracefullyExit);
process.on("SIGTERM", gracefullyExit);

function every15Mins() {
  log("TODO: Invoke callbacks for current state estimators...");
}

setInterval(every15Mins, UPDATE_INTERVAL);
