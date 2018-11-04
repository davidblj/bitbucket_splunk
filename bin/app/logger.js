const splunkjs = require('splunk-sdk');
const config = require('./config');

const ModularInputs = splunkjs.ModularInputs;
const Logger = ModularInputs.Logger;
const stream = config.stream;

function logInfo(message) {
    Logger.info(stream.stanzaName(), message);
}

function logError(message) {
    Logger.error(stream.stanzaName(), message);
}

module.exports = {
    info: logInfo,
    error: logError
}