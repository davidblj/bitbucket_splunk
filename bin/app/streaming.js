const splunkjs = require('splunk-sdk');
const axios = require('axios');
const btoa = require('btoa');
const splunk = require('./splunk');
const http = require('./http');
const config = require('./config');
const logger = require('./logger');

const Async = splunkjs.Async;
const ModularInputs = splunkjs.ModularInputs;
const Event = ModularInputs.Event;
const Logger = ModularInputs.Logger;
const stream = config.stream;

module.exports = (name, singleInput, eventWriter, done) => {

    stream.initialize({name, singleInput, eventWriter, done});    

    axiosConfig();

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

function axiosConfig() {
    
    axios.defaults.baseURL = `https://api.bitbucket.org/2.0/repositories/${stream.ownerInput()}/${stream.repoSlugInput()}/`;
    
    let encondedAuthentication = btoa(`${stream.userInput()}:${stream.passwordInput()}`);
    axios.defaults.headers.common['Authorization'] = `Basic ${encondedAuthentication}`
}

function getPage(pageRef) {

    return (callback) => {

        axios.get(pageRef.nextPageLink)
            .then(handleResponse(pageRef, callback))
            .catch(handleError(callback));            
    }
}

function handleResponse(pageRef, callback) {
    
    return (response) => {

        let pullRequests = response.data.values;    // handle no value in data response

        for(let i = 0; i < pullRequests.length; i++) {

            let pullRequest = pullRequests[i];
            let event = buildEvent(pullRequest)            
            let eventWriter = stream.eventWriter();
            
            eventWriter.writeEvent(event);          // handle event writter failures
        }

        let nextPageLink = response.data.next;
        logger.info(`next page is: ${nextPageLink}`)
        
        if (nextPageLink) {
            pageRef.nextPageLink = nextPageLink;
        } else {
            pageRef.hasNextPage = false;
        }
        
        callback(null)
    }
}

function handleError(callback) {

    return (error) => {
 
        if (error.response) {  

            logger.error(`data: ${error.response.data} \n status: ${error.response.status} \n headers: ${error.response.headers}`);            

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
        stanza: stream.stanzaName(),
        sourcetype: "bitbucket_prs",
        data: data,
        time: Date.parse(pullRequest.created_on)
    });
}
