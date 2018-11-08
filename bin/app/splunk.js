const splunkjs = require('splunk-sdk');
const config = require('./config');
const logger = require('./logger');
const http = require('./http');
const event = require('./event');

const Async = splunkjs.Async;
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

    let params = "state=OPEN | fields id state"

    issueQuery(params, (error, response) => {

        if (error) {

            logger.error(`search failed while trying to get all open prs: ${JSON.stringify(error)}`);                       
            // SCRIPT DIES HERE
            
        } else {
            
            logger.info(`oneshotSearch open state response: ${JSON.stringify(response)}`);                        

            let openPullRequests = response.results;
            let openPullRequestsLength = openPullRequests.length;
            let positionRef = { position: 0 }

            Async.whilst(
            () => {

                return positionRef.position < openPullRequestsLength;
            },
            (finalize) => {

                updatePullRequest(openPullRequests[positionRef.position], positionRef, finalize);
            }, 
            (error) => {

                if (!error) {
                    getLastIndexedEventId(callback);
                } else {
                    let done = stream.doneFunction();
                    done(error);
                }     
            })            
        }
    });   
}

// utils

function getLastId(response) {

    let responseLength = response.results.length;
    let idExists = responseLength > 0;

    if (idExists) {
        return response.results[0].id;
    } else {
        return;
    }
}

function updatePullRequest(pullRequest, positionRef, finalize) {

    let axios = http.getAxiosInstance();
    let id = pullRequest.id;                                        

    axios.get(`pullrequests/${id}`)
        .then((response) => {

            logger.info(`fetch opened pullrequest with id: ${id} and title: ${response.data.title}`);                                    
            let state = response.data.state;
            let newPullRequest = response.data;

            if (state !== "OPEN") {            

                replacePullRequest(newPullRequest, id, positionRef, finalize);

            } else {

                positionRef.position = positionRef.position + 1;    
                finalize(null);
            }            
        })
        .catch((error) => {

            logger.error(`failed to fetch a pullrequest with id ${id}`);
            http.handleHttpError(error);
            finalize(error);            
        });
}

function replacePullRequest(newPullRequest, oldPullRequestId, positionRef, finalize) {

    let params = `id=${oldPullRequestId} | delete`;

    issueQuery(params, (error, response) => {

        if (error) {            
            
            logger.error(`failed to delete a pullrequest with id ${oldPullRequestId}`);
            finalize(error);

        } else {

            logger.info(`replacing an OPEN pullrequest with id: ${oldPullRequestId}`);
            event.writeEvent(newPullRequest);
            
            positionRef.position = positionRef.position + 1;    
            finalize(null);
        }
    });
}

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

module.exports = {
    getLastIndexedEventId,
    updateOpenPrs
}