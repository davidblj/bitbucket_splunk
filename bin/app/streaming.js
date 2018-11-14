const splunkjs = require('splunk-sdk');
const splunk = require('./splunk');
const http = require('./http');
const config = require('./config');
const logger = require('./logger');
const event = require('./event');

const Async = splunkjs.Async;
const stream = config.stream;

module.exports = (name, singleInput, eventWriter, done) => {

    stream.initialize({name, singleInput, eventWriter, done});        
    splunk.updateOpenPrs(getPullRequestsFrom);
}

function getPullRequestsFrom(lastIndexedId) {
    
    let firstLink = http.buildQuery(lastIndexedId);
    logger.info(`initial URI link: ${firstLink}`);

    let pageRef = {
        hasNextPage: true,
        nextPageLink: firstLink
    }

    Async.whilst(() => pageRef.hasNextPage,
                getPage(pageRef),
                callback());    
}

function getPage(pageRef) {

    return (callback) => {

        let axios = http.getAxiosInstance();
        axios.get(pageRef.nextPageLink)
            .then(handleResponse(pageRef, callback))
            .catch(handleError(callback));            
    }
}

function handleResponse(pageRef, callback) {
    
    return (response) => {

        // todo: set next page function
        let nextPageLink = response.data.next;
        logger.info(`next page is: ${nextPageLink}`);

        if (nextPageLink) {
            pageRef.nextPageLink = nextPageLink;
        } else {
            pageRef.hasNextPage = false;
        }

        let pullRequests = response.data.values; 
        let batch = [];

        // TODO: Use a for each. 
        for(let i = 0; i < pullRequests.length; i++) { 

            let pullRequest = pullRequests[i];
            let newEvent = event.buildEventFrom(pullRequest);
            batch.push(newEvent);
        }
        
        writeBatch(batch, callback)
    }
}

function handleError(callback) {

    return (error) => {

        http.handleHttpError(error);
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

// utils 

function writeBatch(batch, callback) {

    let payload = format(batch);
    logger.info(`batch to send ${payload}`);

    let axios = http.getAxiosEventCollectorInstance();
    axios.post('', payload)
        .then(response => callback(null))
        .catch(error => callback(error));
}

function format(batch) {

    let formattedBatch = batch.map(event => JSON.stringify(event));
    let stringifiedBatch = "";
    
    formattedBatch.forEach(event => stringifiedBatch = stringifiedBatch.concat(event));
    return stringifiedBatch;
}