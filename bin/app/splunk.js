const splunkjs = require('splunk-sdk');
const config = require('./config');
const logger = require('./logger');

const Logger = splunkjs.ModularInputs.Logger;
const stream = config.stream;

function getLastIndexedEventId(callback) {
    
    let session = getSession();
    let searchQuery = `search source=${stream.stanzaName()} to_repo="${stream.repoSlugInput()}" | sort -id | head 1`;
    logger.info(`issued query: ${searchQuery}`);

    session.oneshotSearch(searchQuery, {output_mode: "JSON"}, function(error, response) {

        if (error) {            
            
            logger.error(`search failed: ${error}`);                       
            // SCRIPT DIES HERE

        } else {
            
            let lastIndexedId = getLastId(response);
            logger.info(`oneshotSearch response: ${JSON.stringify(response)}`);
            logger.info(`last id retrieved: ${lastIndexedId}`);
            
            callback(lastIndexedId);
        }
    });    
}

function getSession() {

    return new splunkjs.Service({
        username: "admin",
        password: "Omegadjb-1122",
        scheme:"https",
        host:"localhost",
        port:"8089",        
    });
}

function getLastId(response) {

    let responseLength = response.results.length;
    let idExists = responseLength > 0;

    if (idExists) {
        return response.results[0].id;
    } else {
        return;
    }
}

module.exports = {
    getLastIndexedEventId
}
