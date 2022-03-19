// TODO: json parse the solar api data
// TODO: mqtt publish to a topic

let print = console.log;

const https = require("https");
const options = {
  hostname: "api.solcast.com.au",
  port: 443,
  path: "/world_pv_power/estimated_actuals?latitude=11.749142&longitude=75.489035&capacity=5&tilt=12&azimuth=180&hours=168&format=json&api_key=LscmE7tIq2Jh44XyAgLCuTmgXP-Ce8eG",
  method: "GET",
};

let pv_estimates = [];

https
  .request(options, (res) => {
    let bodyChunks = [];
    res
      .on("data", (data) => {
        bodyChunks.push(data);
      })
      .on("end", function () {
        let data = JSON.parse(Buffer.concat(bodyChunks));
        data.estimated_actuals.forEach((row) => {
          pv_estimates.push(row.pv_estimate);
        });
      });
  })
  .on("error", console.error)
  .end();
