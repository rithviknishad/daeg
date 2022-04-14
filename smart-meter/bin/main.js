require("dotenv").config();

const chalk = require("chalk");
const mqtt = require("mqtt");
const log = require("./logger");
const fs = require("fs");
const Papa = require("papaparse");
const { stringify } = require("querystring");
const axios = require("axios").default;

/**
 * Vaidyuti Protocol Address assigned to the prosumer.
 */
const VP_ADDRESS = process.env.VP_ADDRESS || "no-vp-addr";
log.trace(`Starting prosumer with VP_ADDRESS=${VP_ADDRESS}`);
const PARENT_VP_ADDRESS = VP_ADDRESS.split(":").slice(0, -1).join(":");
log.trace(`PARENT_VP_ADDRESS=${PARENT_VP_ADDRESS}`);

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
log.trace(`Prosumer PV system installed capacity=${PV_SYSTEM_CAPACITY} kW`);

/**
 * Prosumer's Energy system installed capacity in KWH.
 */
const STORAGE_SYSTEM_CAPACITY = process.env.STORAGE_SYSTEM_CAPACITY || 5;
log.trace(`Prosumer storage system capacity=${STORAGE_SYSTEM_CAPACITY} kWh`);

/**
 * The nominal, on-peak and off-peak selling price limits of the prosumer.
 */
const NOMINAL_SELLING_PRICE = process.env.NOMINAL_SELLING_PRICE || 5;
const ON_PEAK_SELLING_PRICE = process.env.ON_PEAK_SELLING_PRICE || 10;
const OFF_PEAK_SELLING_PRICE = process.env.OFF_PEAK_SELLING_PRICE || 3;
log.trace(
  `Prosumer selling price={${OFF_PEAK_SELLING_PRICE}, ${NOMINAL_SELLING_PRICE}, ${ON_PEAK_SELLING_PRICE}}`
);

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
 * Note: this will affect the `CONTRACT_INTERVAL`s effective value.
 */
const SIMULATION_SPEED = process.env.SIMULATION_SPEED || 1;
log.trace(`Simulation speed set to: ${SIMULATION_SPEED}x`);

/**
 * The interval at which contracts should be exchanged and communicated with
 * the associated Microgrid Energy Management System's API Server. Defaults to
 * 15 minutes.
 * Value should be in milliseconds.
 */
const CONTRACT_INTERVAL =
  (process.env.CONTRACT_INTERVAL || 900000) / SIMULATION_SPEED;
log.trace(
  `Contracts will be exchanged every ${
    CONTRACT_INTERVAL / 1000
  } seconds (real world clock).`
);

/**
 * The path to mock CSV profile to be used by the smart-meter.
 */
const MOCK_CSV_PROFILE_PATH =
  process.env.MOCK_CSV_PROFILE_PATH || "profile.csv";
log.trace(`Using mock profile from=${MOCK_CSV_PROFILE_PATH}`);

/**
 * The resource link to the associated MGEMS server of the prosumer.
 */
const MGEMS_BASE_URL =
  process.env.MGEMS_BASE_URL || "http://dev.vaidyuti.io:8000/api";
log.trace(`Local micro-grid resource=${MGEMS_BASE_URL}`);

/**
 * The resource link to where MQTT server of the MGEMS is hosted.
 */
const MGEMS_MQTT_URL = process.env.MGEMS_MQTT_URL || `mqtt://dev.vaidyuti.io`;

/**
 * the initial selling price
 */
const SELLING_PRICE = process.env.SELLING_PRICE;
/**
 * The MQTT Client ID of the prosumer.
 */
const MQTT_CLIENT_ID = `prosumer-${VP_ADDRESS.replace(":", "_")}`;

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

let grid_generation = 0;
let grid_consumption = 0;

client
  .on("connect", () => {
    log.success(`${chalk.yellowBright("⚡")} Connected to ${MGEMS_MQTT_URL}`);
    client.subscribe(`prosumers/${PARENT_VP_ADDRESS}/generation`);
    client.subscribe(`prosumers/${PARENT_VP_ADDRESS}/consumption`);
  })
  .on("message", (topic, payload, packet) => {
    if (topic.includes("generation")) {
      grid_generation = parseFloat(payload);
    }
    if (topic.includes("consumption")) {
      grid_consumption = parseFloat(payload);
    }
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

const mgemsServer = axios.create({
  baseURL: MGEMS_BASE_URL,
  timeout: 1000,
});

function prosumerSetup() {
  log.log("Registering prosumer");
  mgemsServer
    .post(`/prosumers/`, {
      id: VP_ADDRESS,
      max_import_power: 2.1,
      max_export_power: 2.1,
      is_online: true,
      is_dr_adaptive: true,
      is_trader: true,
    })
    .then((response) => {
      log.success("Prosumer registered.");
    })
    .catch((error) => {
      log.error(`${error}. Prosumer not registered.`);
      // gracefullyExit();
    });
}

/**
 * The Generation , Consumption , Storage and Import uniits of each prosumer.
 */
const profile = [];

fs.createReadStream(MOCK_CSV_PROFILE_PATH)
  .pipe(Papa.parse(Papa.NODE_STREAM_INPUT, { header: true }))
  .on("data", (data) => {
    profile.push(data);
  })
  .on("end", () => {
    setInterval(prosumerLoop, CONTRACT_INTERVAL);
  });

let cItr = 0;
let batteryEnergy = STORAGE_SYSTEM_CAPACITY * 0.5; // in kWh

function updateState(state_key, state_value) {
  client.publish(`prosumers/${VP_ADDRESS}/${state_key}`, `${state_value}`);
}

function computeExportPrice() {
  let puConsumption = grid_consumption / grid_generation;
  if (puConsumption >= 1.01) return ON_PEAK_SELLING_PRICE;
  if (puConsumption <= 0.99) return OFF_PEAK_SELLING_PRICE;
  return NOMINAL_SELLING_PRICE;
}

function prosumerLoop() {
  cItr = cItr % (profile.length - 1);
  cItr = cItr + 1;

  let net_charge_rate = profile[cItr].generation - profile[cItr].consumption;
  let net_import = 0;

  if (
    batteryEnergy + net_charge_rate > 0 &&
    batteryEnergy + net_charge_rate < STORAGE_SYSTEM_CAPACITY
  ) {
    batteryEnergy = batteryEnergy + net_charge_rate;
  } else {
    net_import = -net_charge_rate;
  }

  updateState("generation", profile[cItr].generation);
  updateState("consumption", profile[cItr].consumption);
  updateState("storage", batteryEnergy);
  updateState("import", net_import);
  updateState("export_price", computeExportPrice());

  // TODO: whether this prosumer can export energy at present
  // updateState("can_export", true or false);
}

prosumerSetup();
