require("dotenv").config();

const chalk = require("chalk");
const mqtt = require("mqtt");
const log = require("./logger");
const fs = require("fs");
const Papa = require("papaparse");

/**
 * Vaidyuti Protocol Address assigned to the prosumer.
 */
const VP_ADDRESS = process.env.VP_ADDRESS || "no-vp-addr";
log.trace(`Starting prosumer with VP_ADDRESS=${VP_ADDRESS}`);

/**
 * Prosumer's geographic location attributes: latitude, longitude.
 */
const LATITUDE = process.env.LATITUDE || 11.75;
const LONGITUDE = process.env.LONGITUDE || 75.49;
log.trace(`Prosumer location=(${LATITUDE}, ${LONGITUDE})`);

/**
 * Prosumer's PV system installed capacity in KW.
 */
const PV_SYSTEM_CAPACITY = process.env.PV_SYSTEM_CAPACITY || 5;
log.trace(`Prosumer PV system installed capacity=${PV_SYSTEM_CAPACITY} KW`);

/**
 * Prosumer's Energy system installed capacity in KWH.
 */
const STORAGE_SYSTEM_CAPACITY = process.env.STORAGE_SYSTEM_CAPACITY || 5;
log.trace(`Prosumer storage system capacity=${STORAGE_SYSTEM_CAPACITY} KWH`);

/**
 * Solcast API Key for solar forecasting.
 */
const SOLCAST_API_KEY = process.env.SOLCAST_API_KEY;
if (!SOLCAST_API_KEY) {
  log.warn(`Solcast API key is missing`);
}

/**
 * The speed at which the prosumer meters clock should run.
 * Defaults to 1x.
 * Eg: `SIMULATION_SPEED=2` means the clock shall run two times faster than
 * real-world clock.
 * Note: this will affect the `UPDATE_INTERVAL`s effective value.
 */
const SIMULATION_SPEED = process.env.SIMULATION_SPEED || 1;
log.trace(`Simulation speed set to: ${SIMULATION_SPEED}x`);

/**
 * The interval at which contracts should be exchanged and communicated with
 * the associated Microgrid Energy Management System's API Server. Defaults to
 * 15 minutes.
 * Value should be in milliseconds.
 */
const UPDATE_INTERVAL =
  (process.env.UPDATE_INTERVAL || 900000) / SIMULATION_SPEED;
log.trace(
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

log.log(`Connecting to ${MGEMS_MQTT_URL}`);
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
    log.success(`${chalk.yellowBright("⚡")} Connected to ${MGEMS_MQTT_URL}`);
  })
  .on("disconnect", () => {
    log.error("MQTT client disconnected.");
  })
  .on("close", () => {
    log.error("MQTT connection closed.");
  })
  .on("end", () => {
    log.error("MQTT connection ended.");
  });

function gracefullyExit() {
  log.logger("");
  log.warn("Prosumer Meter interrupted. Gracefully exiting...");
  client.end(false, {}, () => {
    process.exit();
  });
}

process.on("SIGINT", gracefullyExit);
process.on("SIGTERM", gracefullyExit);

function solar_operations(client, address, index) {
  let solar_forecast = pv_estimates[index];
  client.publish(`prosumers/${VP_ADDRESS}/generation/0`, solar_forecast);
}

function prosumerSetup() {
  // TODO: register prosumer to MGEMS server using HTTP POST
  // TODO: gracefully terminate with exit code 1, if response != OK
}

/**
 * The Generation , Consumption , Storage and Import uniits of each prosumer.
 */
const csv = [];

fs.createReadStream("profile1.csv")
  .pipe(Papa.parse(Papa.NODE_STREAM_INPUT, { header: true }))
  .on("data", (data) => {
    csv.push(data);
  })
  .on("end", () => {
    setInterval(prosumerLoop, UPDATE_INTERVAL);
  });

let c_itr = 0;
let batteryEnergy = STORAGE_SYSTEM_CAPACITY * 0.5; // in kWH

function prosumerLoop() {
  c_itr = c_itr % (csv.length - 1);
  c_itr = c_itr + 1;

  let net_charge_rate = csv[c_itr].generation - csv[c_itr].consumption;
  let net_import = 0;

  if (
    batteryEnergy + net_charge_rate > 0 &&
    batteryEnergy + net_charge_rate < STORAGE_SYSTEM_CAPACITY
  ) {
    batteryEnergy = batteryEnergy + net_charge_rate;
  } else {
    net_import = -net_charge_rate;
  }

  client.publish(
    `prosumers/${VP_ADDRESS}/generation`,
    `${csv[c_itr].generation}`
  );
  client.publish(
    `prosumers/${VP_ADDRESS}/consumption`,
    `${csv[c_itr].consumption}`
  );
  client.publish(`prosumers/${VP_ADDRESS}/storage`, `${batteryEnergy}`);
  client.publish(`prosumers/${VP_ADDRESS}/import`, `${net_import}`);
}

prosumerSetup();
