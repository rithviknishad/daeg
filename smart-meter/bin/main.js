require("dotenv").config();

const mqtt = require("mqtt");

const VP_ADDRESS = process.env.VP_ADDRESS;
const MGEMS_MQTT_URL = process.env.MGEMS_MQTT_URL;
const MQTT_CLIENT_ID = `prosumer-${VP_ADDRESS}`;
const MQTT_USERNAME = `${VP_ADDRESS}`;
const MQTT_PASSWORD = `${VP_ADDRESS}`;

let client = mqtt.connect(process.env.MGEMS_MQTT_URL, {
    clientId: MQTT_CLIENT_ID,
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    clean: false, // Volunatarily set to false to allow receiving QoS 1 and 2 messages when offline.
});

client.on("connect", () => {
    console.log("Connected");
});
