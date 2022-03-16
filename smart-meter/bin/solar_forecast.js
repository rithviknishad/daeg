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

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);

  var bodyChunks = [];
  res
    .on("data", function (chunk) {
      // You can process streamed parts here...
      bodyChunks.push(chunk);
    })
    .on("end", function () {
      var body = Buffer.concat(bodyChunks);

      let data = JSON.parse(body);
      data.estimated_actuals.forEach((row) => {
        // console.log(row.period_end + "-" + row.pv_estimate);
      });
    });
});

req.on("error", console.error);

req.end();
