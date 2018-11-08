const splunkjs = require('splunk-sdk');
const config = require('./config');

const ModularInputs = splunkjs.ModularInputs;
const Event = ModularInputs.Event;
const stream = config.stream;

function writeEvent(pullRequest) {

    let event = buildEventFrom(pullRequest);            
    let eventWriter = stream.eventWriter();
        
    // TODO: handle write failures
    eventWriter.writeEvent(event);
}

function buildEventFrom(pullRequest) {
    
    let data = {
        id: pullRequest.id,
        title: pullRequest.title,
        to_branch: pullRequest.destination.branch.name,
        from_branch: pullRequest.source.branch.name,
        author: pullRequest.author.username,
        state: pullRequest.state, 
        from_repo: pullRequest.destination.repository.name,
        to_repo: pullRequest.source.repository.name,
        approvers: getApprovers(pullRequest)                               
    };

    return new Event({
        stanza: stream.stanzaName(),
        sourcetype: "bitbucket_prs",
        data: data,
        time: Date.parse(pullRequest.created_on)
    });
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
        return '';
    }   
}

module.exports = {
    writeEvent
}