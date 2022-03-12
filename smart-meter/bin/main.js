const yargs = require("yargs");

const options = yargs.usage("Usage: prosumer").option("a", {
    alias: "prosumer-id",
    default: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
    describe: "Prosumer EP Address",
    type: "string",
    demandOption: false,
}).argv;

const greeting = `Hello, ${options.name}!`;

console.log(greeting);
