const splunkjs = require("splunk-sdk");
const axios = require('axios');

const Async = splunkjs.Async;
const ModularInputs = splunkjs.ModularInputs;
const Logger = ModularInputs.Logger;

module.exports = (name, singleInput, eventWriter, done) => {

    // todo: use these values to make a request
    let username = singleInput.username;
    let repo_slug = singleInput.repository;

    axiosConfig()

    let hasNextPageRef = {};
    hasNextPageRef.state = true;

    Async.whilst(() => hasNextPageRef.state,
                 getPage(hasNextPageRef, name, done),
                 callback(done))
}

function axiosConfig() {
    axios.defaults.baseURL = 'https://api.bitbucket.org/2.0/';
}

// function_2: iterate through the pages, modify the boolean (which stops the stream) and stop iterating. 
function getPage(hasNextPageRef, name, done) {

    return (callback) => {
        
        // while link.next, do not change the iteratee boolean, and use currentPageRef
        hasNextPageRef.state = false;

        axios.get(`repositories/davidblj/testing/pullrequests`)
            .then(handleResponse(name, callback))
            .catch(handleError(name, callback, done));            
    }
}

// function_3: finalize the execution, call done or done(error)
function callback(done) {

    return (error) => {

        if (error) {
            done(error)
        } else {
            done()
        }
    }
}

function handleResponse(name, callback) {
    
    return (response) => {

        // iterate
        let pullRequests = response.data.values;

        for(let i = 0; i < pullRequests.length; i++) {

            let pullRequest = pullRequests[i];

            let pullRequestId = pullRequest.id;
            let destinationBranch = pullRequest.destination.branch.name;
            let sourceBranch = pullRequest.source.branch.name;
            let pullRequestName = pullRequest.title;

            Logger.info(name, `id: ${pullRequestId}, title: ${pullRequestName} , destination branch: ${destinationBranch}, source branch: ${sourceBranch}`);
        }

        callback(null)
        
        // todo: use done when an error is thrown 
    }
}

function handleError(name, callback, done) {

    return (error) => {

        // make "done" to work. 
        if (error.response) {          
            Logger.error(name, `data: ${error.response.data} \n
                                status: ${error.response.status} \n
                                headers: ${error.response.headers}`);            
        } else if (error.request) {            
            Logger.error(name, `no server response: ${JSON.stringify(error.request)}`);            
        } else {
            Logger.error(name, `configuration not set properly: ${error.message}`);           
        }

        Logger.error(name, `config log: ${JSON.stringify(error.config)}`);                
        
        callback(error);
        done(error);
    }
}