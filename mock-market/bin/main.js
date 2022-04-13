const mqtt = require("mqtt");

const options = {
  clean: true,
};

const VP_ADDRESS = process.env.VP_ADDRESS || "no-vp-addr";
const UPDATE_INTERVAL = process.env.UPDATE_INTERVAL || 5000;

const client = mqtt.connect("mqtt://dev.vaidyuti.io");

const mean_generation = 45000;
const mean_consumption = 45000;
const multiplier = 1000;

function updateState(state_key, state_value) {
  client.publish(`prosumers/${VP_ADDRESS}/${state_key}`, `${state_value}`);
}

const __applyRandomVariation = (base, scale) =>
  base + (Math.random() - 0.5) * scale;

function loop() {
  let generation = __applyRandomVariation(mean_generation, 1000);
  let consumption = __applyRandomVariation(mean_consumption, 1000);

  updateState("generation", generation);
  updateState("consumption", consumption);
}

client.on("connect", () => {
  setInterval(loop, UPDATE_INTERVAL);
});
