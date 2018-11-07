const splunkjs = require('splunk-sdk');
const config = require('./config');
const logger = require('./logger');
const http = require('./http');

const Logger = splunkjs.ModularInputs.Logger;
const stream = config.stream;

// TODO: use promises to make a more sequential code with async/await
function getLastIndexedEventId(callback) {
    
    let params = "| sort -id | head 1";
    issueQuery(params, (error, response) => {

        if (error) {            
            
            logger.error(`search failed while trying to get the last id: ${JSON.stringify(error)}`);                       
            // SCRIPT DIES HERE

        } else {
            
            let lastIndexedId = getLastId(response);
            logger.info(`oneshotSearch last id response: ${JSON.stringify(response)}`);
            logger.info(`last id retrieved: ${lastIndexedId}`);
            
            callback(lastIndexedId);
        }
    });        
}

function updateOpenPrs(callback) {

    let params = "state=OPEN"
    issueQuery(params, (error, response) => {

        if (error) {

            logger.error(`search failed while trying to get all open prs: ${JSON.stringify(error)}`);                       
            // SCRIPT DIES HERE            

        } else {

            // loop all open prs
            // make an http call on that pr
            // insert our new event
            logger.info(`oneshotSearch open state response: ${JSON.stringify(response)}`);                        
            getLastIndexedEventId(callback);
        }
    });   
}

// utils

function issueQuery(params, callback) {
    
    let session = getSession();
    let searchQuery = `search source="${stream.stanzaName()}" to_repo="${stream.repoSlugInput()}" ${params}`;
    logger.info(`issued query: ${searchQuery}`);

    session.oneshotSearch(searchQuery, {output_mode: "JSON"}, callback);
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

function writeUpdatedPr() {

}

module.exports = {
    getLastIndexedEventId,
    updateOpenPrs
}
