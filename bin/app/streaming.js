const splunkjs = require("splunk-sdk");
const axios = require('axios');
const btoa = require('btoa')

const Async = splunkjs.Async;
const ModularInputs = splunkjs.ModularInputs;
const Event = ModularInputs.Event;
const Logger = ModularInputs.Logger;

module.exports = (name, singleInput, eventWriter, done) => {

    let owner = singleInput.owner;
    let repo_slug = singleInput.repository;
    let user = singleInput.user;
    let password = singleInput.password;

    Logger.info(name, `user is: ${user}, and password is ${password}`)

    axiosConfig(owner, repo_slug, user, password)

    let hasNextPageRef = {};
    hasNextPageRef.state = true;

    Async.whilst(() => hasNextPageRef.state,
                 getPage(hasNextPageRef, eventWriter, name, done),
                 callback(done))
}

function axiosConfig(owner, repo_slug, user, password) {
    
    axios.defaults.baseURL = `https://api.bitbucket.org/2.0/repositories/${owner}/${repo_slug}/`;
    
    let encondedAuthentication = btoa(`${user}:${password}`);
    Logger.info(`encoded auth is ${encondedAuthentication}`);

    axios.defaults.headers.common['Authorization'] = `Basic ${encondedAuthentication}`
}

// todo: iterate through the pages, modify the boolean (which stops the stream) and stop iterating. 
function getPage(hasNextPageRef, eventWriter, name, done) {

    return (callback) => {
        
        // while link.next, do not change the iteratee boolean, and use currentPageRef
        hasNextPageRef.state = false;

        axios.get(`pullrequests`)
            .then(handleResponse(name, eventWriter, callback))
            .catch(handleError(name, callback, done));            
    }
}

// todo: finalize the execution, call done or done(error)
function callback(done) {

    return (error) => {

        if (error) {
            done(error)
        } else {
            done()
        }
    }
}

function handleResponse(name, eventWriter, callback) {
    
    return (response) => {

        let pullRequests = response.data.values;

        for(let i = 0; i < pullRequests.length; i++) {

            let pullRequest = pullRequests[i];
            let event = buildEvent(pullRequest)            
            eventWriter.writeEvent(event);      // catch errors 
        }

        callback(null)
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

function buildEvent(pullRequest) {

    let data = {
        id: pullRequest.id,
        title: pullRequest.title,
        to_branch: pullRequest.destination.branch.name,
        from_branch: pullRequest.source.branch.name,
        author: pullRequest.author.username,
        state: pullRequest.state, 
        from_repo: pullRequest.destination.repository.name,
        to_repo: pullRequest.source.repository.name,                        
    };

    return new Event({
        stanza: pullRequest.title,
        sourcetype: "bitbucket_prs",
        data: data,
        time: Date.parse(pullRequest.created_on)
    });
}
