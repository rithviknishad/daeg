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

module.exports = { log, trace, warn, error, success, logger };
