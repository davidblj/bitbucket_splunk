const splunkjs = require("splunk-sdk");
const Logger = splunkjs.ModularInputs.Logger;

function getLastIndexedEventId(name, repo_slug, callback) {
    
    let session = getSession();
    let searchQuery = `search source=${name} to_repo="${repo_slug}" | sort -id | head 1`;
    Logger.info(name, `issued query: ${searchQuery}`);

    session.oneshotSearch(searchQuery, {output_mode: "JSON"}, function(error, response) {

        if (error) {            
            
            Logger.error(name, `search failed: ${error}`);                       
            // SCRIPT DIES HERE

        } else {
            
            let lastIndexedId = getLastId(response);
            Logger.info(name, `oneshotSearch response: ${JSON.stringify(response)}`);
            Logger.info(name, `last id retrieved: ${lastIndexedId}`);
            
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
    getLastIndexedEventId: getLastIndexedEventId
}
