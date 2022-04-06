const fs = require("fs");
const Papa = require("papaparse");
//function load_func(onfinish_cb) {
const load_profile = [];
let load_profile_ready = false;

fs.createReadStream("load_profile.csv")
  .pipe(Papa.parse(Papa.NODE_STREAM_INPUT, { header: true }))
  .on("data", (data) => {
    load_profile.push(data.Load);
  })
  .on("end", () => {
    load_profile_ready =false;
  });
