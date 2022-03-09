let print = console.log

const https = require('https')
const options = {
  hostname: 'api.solcast.com.au',
  port: 443,
  path: '/world_pv_power/estimated_actuals?latitude=11.749142&longitude=75.489035&capacity=5&tilt=12&azimuth=180&hours=168&format=json&api_key=LscmE7tIq2Jh44XyAgLCuTmgXP-Ce8eG',
  method: 'GET'
}

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', data => {
      console.log(String.fromCharCode(...data))
      // convert json string to js object
      // iterate through each data of estimated_actuals and print it
      let obj =  {}

      obj["timestamp"]

  })
})

req.on('error', console.error)

req.end()