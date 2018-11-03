const splunkjs = require("splunk-sdk");
const Logger = splunkjs.ModularInputs.Logger;
const splunkSearch = splunkjs.Service.Jobs;

function getLastEventId(name, callback) {
    
    let searchQuery = "source=bitbucket_pull_requests | sort -id | head 1";
    splunkSearch.oneshotSearch(searchQuery, {output_mode: "JSON"}, function(error, results) {
        
        // todo: handle error
        Logger.info(name, `splunk search is a success: ${results}`);
        
        // get the id
        // run that callback with that id
        let placeholderId = 1230;
        callback(placeholderId);
    });    
}

module.exports = {
    getLastEventId: getLastEventId
}