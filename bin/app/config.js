const splunkLogging = require('splunk-logging').Logger;
const logger = require('./logger');

let streamStore = {};
let stream = {
    
    initialize: (streamObject) => {
        streamStore = streamObject;
    },
    eventWriter: () => {
        return streamStore.eventWriter;
    },
    stanzaName: () => {
        return streamStore.name;
    },
    doneFunction: () => {
        return streamStore.done;
    },
    ownerInput: () => {
        return streamStore.singleInput.owner;
    },
    repoSlugInput: () => {
        return streamStore.singleInput.repository;
    },
    userInput: () => {
        return streamStore.singleInput.user;
    },
    passwordInput: () => {
        return streamStore.singleInput.password;
    },
    portInput: () => {
        return streamStore.singleInput.port;
    },
    hostnameInput: () => {
        return streamStore.singleInput.hostname;
    },
    tokenINput: () => {
        return streamStore.singleInput.token;
    }
};

let splunkLoggerStore;
let splunkLogger = {

    initialize: () => {

        let config = {
            token: "B5AEABF1-8C34-49AB-A927-61509B383949",
            url: "http://localhost:8088/services/collector",
            batchInterval: 1000,
            maxBatchCount: 25,
            maxBatchSize: 100000
        }

        splunkLoggerStore = new splunkLogging(config);
        
        splunkLoggerStore.error = function (error, context) {
            logger.error(`HEC error: ${error}, in context: ${context}`)
        }
    },
    getInstance: () => {
        return splunkLoggerStore;
    }
}

module.exports = {
    stream,
    splunkLogger
}
