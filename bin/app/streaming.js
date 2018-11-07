const splunkjs = require('splunk-sdk');
const btoa = require('btoa');
const splunk = require('./splunk');
const http = require('./http');
const config = require('./config');
const logger = require('./logger');
const event = require('./event');

const Async = splunkjs.Async;
const stream = config.stream;

// TODOS:
/*  
    - update open prs in splunk index -> to merge/declined requests (Prs x Branch).
        - make it an scheduled report.
    - time approval: how to get that info.
    - fix no declined prs response ? 
*/

module.exports = (name, singleInput, eventWriter, done) => {

    stream.initialize({name, singleInput, eventWriter, done});    

    let callback = getPullRequests();
    splunk.getLastIndexedEventId(callback);
}

function getPullRequests() {

    return (lastIndexedId) => {

        let firstLink = http.buildQuery(lastIndexedId);
        logger.info(`initial URI link: ${firstLink}`);

        let pageRef = {
            hasNextPage: true,
            nextPageLink: firstLink
        }

        Async.whilst(() => pageRef.hasNextPage,
                    getPage(pageRef),
                    callback())
    }
}

function getPage(pageRef) {

    return (callback) => {

        let axios = http.getAxiosInstance
        axios.get(pageRef.nextPageLink)
            .then(handleResponse(pageRef, callback))
            .catch(handleError(callback));            
    }
}

function handleResponse(pageRef, callback) {
    
    return (response) => {

        let pullRequests = response.data.values;    // handle no value in data response (?)

        for(let i = 0; i < pullRequests.length; i++) {

            let pullRequest = pullRequests[i];
            event.writeEvent(pullRequest);
        }

        let nextPageLink = response.data.next;
        logger.info(`next page is: ${nextPageLink}`);

        if (nextPageLink) {
            pageRef.nextPageLink = nextPageLink;
        } else {
            pageRef.hasNextPage = false;
        }
        
        callback(null);
    }
}

function handleError(callback) {

    return (error) => {
 
        if (error.response) {  

            logger.error(`data: ${JSON.stringify(error.response.data)} \n status: ${error.response.status} \n headers: ${JSON.stringify(error.response.headers)}`);            

        } else if (error.request) {            

            logger.error(`no server response: ${JSON.stringify(error.request)}`);            

        } else {

            logger.error(`configuration not set properly: ${error.message}`);           
        }

        logger.error(`config log: ${JSON.stringify(error.config)}`);                
        callback(error);
    }
}

function callback() {

    return (error) => {

        let done = stream.doneFunction();

        if (error) {
            done(error);
        } else {
            done();
        }

        // SCRIPT DIES HERE
    }
}
