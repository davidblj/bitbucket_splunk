const splunkjs = require('splunk-sdk');
const Scheme = require('./scheme');
const Streaming = require('./streaming');

const ModularInputs = splunkjs.ModularInputs;

execute();

function execute() {

    exports.getScheme = Scheme;    
    exports.streamEvents = Streaming;

    ModularInputs.execute(exports, module);
}
