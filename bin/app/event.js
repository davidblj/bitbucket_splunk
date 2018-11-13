const splunkjs = require('splunk-sdk');
const splunkLogging = require('splunk-logging').Logger;
const config = require('./config');
const logger = require('./logger');

const stream = config.stream;

function writeEvent(pullRequest) {

    let event = getEventFrom(pullRequest);            
        
    let eventWriter = new splunkLogging(getConfig());
    setErrorHandlerTo(eventWriter);

    logger.info(`sending event ! ${stream.stanzaName()}`)
    eventWriter.send(event);
}

function getEventFrom(pullRequest) {
    
    let event = {
        id: pullRequest.id,
        title: pullRequest.title,
        to_branch: pullRequest.destination.branch.name,
        from_branch: pullRequest.source.branch.name,
        author: pullRequest.author.username,
        state: pullRequest.state, 
        from_repo: pullRequest.destination.repository.name,
        to_repo: pullRequest.source.repository.name,
        approvers: getApprovers(pullRequest),
        merge_time_hours: getMergeTime(pullRequest)                               
    };

    return {
        message: event,
        metadata: {
            time: Date.parse(pullRequest.created_on),
            source: stream.stanzaName(),
            sourcetype: "bitbucket_prs",
            index: "main",            
        }
    }
}

function getApprovers(pullRequest) {

    let participants = pullRequest.participants;
    let approvers = [];
    
    participants.forEach(participant => {
        let author = participant.user.username;     
        if (participant.approved) approvers.push(author);
    });

    let prHasApprovers = approvers.length > 0;
    
    if (prHasApprovers) {
        return approvers.join(",");
    } else {
        return "";
    }   
}

function getMergeTime(pullRequest) {

    let pullRequestIsMerged = pullRequest.state === "MERGED";

    if (pullRequestIsMerged) {

        let dateCreatedInMs = new Date(pullRequest.created_on).getTime();
        let dateMergedInMs = new Date(pullRequest.updated_on).getTime();
        let timeElapsed = dateMergedInMs - dateCreatedInMs;

        return getHours(timeElapsed);

    } else {

        return "";
    }
}

function getHours(miliseconds) {
    
    let hours = miliseconds / 1000 / 60 / 60;
    let roundedHours = Math.ceil(hours);

    return roundedHours;
}

function getConfig() {

    return {
        token: "B5AEABF1-8C34-49AB-A927-61509B383949",
        url: "http://localhost:8088/services/collector",
        batchInterval: 500,
        maxBatchCount: 25,
        maxBatchSize: 100000
    } 
}

function setErrorHandlerTo(eventWriter) {
    
    eventWriter.error = function (error, context) {
        logger.error(`HEC error: ${error}, in context: ${context}`)
    }
}

module.exports = {
    writeEvent
}