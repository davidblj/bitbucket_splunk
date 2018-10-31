const splunkjs = require("splunk-sdk");
const axios = require('axios');

const ModularInputs = splunkjs.ModularInputs;
const Logger = ModularInputs.Logger;
const Async = splunkjs.Async;
const Event = ModularInputs.Event;
const Scheme = ModularInputs.Scheme;
const Argument = ModularInputs.Argument;

execute()

function execute() {

    // todo: make a function, per file: scheme, validation, stream
    exports.getScheme = function() {

        var scheme = new Scheme("Bitbucket pull requests");

        scheme.description = "Streaming de pull requests";
        scheme.useExternalValidation = false;  
        scheme.useSingleInstance = true;

        scheme.args = [
            new Argument({
                name: "username",
                dataType: Argument.dataTypeString,
                description: "El nombre del usuario dueño del repositorio.",
                requiredOnCreate: true,
                requiredOnEdit: false
            }),
            new Argument({
                name: "repository",
                dataType: Argument.dataTypeString,
                description: "El nombre del repositorio o repo-slug",
                requiredOnCreate: true,
                requiredOnEdit: false
            })
        ];

        return scheme;
    };

    /*
    // todo: validate authentication 
    exports.validateInput = function(definition, done) {
        var count = parseInt(definition.parameters.count, 10);
        // done() or done(error)
    };
    */

    exports.streamEvents = function(name, singleInput, eventWriter, done) {

        // todo: use these values to make a request
        let username = singleInput.username;
        let repo_slug = singleInput.repository;

        axiosConfig()

        let hasNextPageRef = {};
        hasNextPageRef.state = true;

        // function_1: use a boolean (stream while true)
        Async.whilst(() => hasNextPageRef.state,
                     getPage(hasNextPageRef, name, done),
                     callback(done))      
    };

    ModularInputs.execute(exports, module);
};

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
            .catch(handleError(name, callback, done))            
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
