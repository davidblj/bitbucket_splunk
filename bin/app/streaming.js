const splunkjs = require('splunk-sdk');
const axios = require('axios');
const btoa = require('btoa');
const splunk = require('./splunk');
const http = require('./http');

const Async = splunkjs.Async;
const ModularInputs = splunkjs.ModularInputs;
const Event = ModularInputs.Event;
const Logger = ModularInputs.Logger;

module.exports = (name, singleInput, eventWriter, done) => {

    // this should definitly be an object 
    let owner = singleInput.owner;
    let repo_slug = singleInput.repository;
    let user = singleInput.user;
    let password = singleInput.password;

    // make axios a new module
    axiosConfig(owner, repo_slug, user, password);

    let callback = getPullRequests(eventWriter, name, done);
    splunk.getLastIndexedEventId(name, repo_slug, callback);
}

function getPullRequests(eventWriter, name, done) {

    return (lastIndexedId) => {

    let firstLink = http.buildQuery(lastIndexedId);
    Logger.info(name, `initial URI link: ${firstLink}`);

    let pageRef = {
        hasNextPage: true,
        nextPageLink: firstLink
    }

    Async.whilst(() => pageRef.hasNextPage,
                 getPage(pageRef, eventWriter, name, done),
                 callback(done))
    }
}

function axiosConfig(owner, repo_slug, user, password) {
    
    axios.defaults.baseURL = `https://api.bitbucket.org/2.0/repositories/${owner}/${repo_slug}/`;
    
    let encondedAuthentication = btoa(`${user}:${password}`);
    axios.defaults.headers.common['Authorization'] = `Basic ${encondedAuthentication}`
}

function getPage(pageRef, eventWriter, name, done) {

    return (callback) => {

        axios.get(pageRef.nextPageLink)
            .then(handleResponse(pageRef, name, eventWriter, callback))
            .catch(handleError(name, callback));            
    }
}

function callback(done) {

    return (error) => {

        if (error) {
            done(error)
        } else {
            done()
        }
    }
}

function handleResponse(pageRef, name, eventWriter, callback) {
    
    return (response) => {

        let pullRequests = response.data.values;

        for(let i = 0; i < pullRequests.length; i++) {

            let pullRequest = pullRequests[i];
            let event = buildEvent(name, pullRequest)            
            eventWriter.writeEvent(event);      // catch errors (pass down error)
        }

        let nextPageLink = response.data.next;
        Logger.info(name, `next page is: ${nextPageLink}`)
        
        if (nextPageLink) {
            pageRef.nextPageLink = nextPageLink;
        } else {
            pageRef.hasNextPage = false;
        }
        
        callback(null)
    }
}

function handleError(name, callback) {

    return (error) => {
 
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
    }
}

function buildEvent(name, pullRequest) {

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
        stanza: name,
        sourcetype: "bitbucket_prs",
        data: data,
        time: Date.parse(pullRequest.created_on)
    });
}
