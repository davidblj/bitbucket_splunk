let streamStore = {};

let stream = {
    
    initialize: (streamObject) => {
        streamStore = streamObject;
    },
    eventWriter: () => {
        return streamStore.eventWriter;
    },
    stanzaName: () => {
        return streamStore.name;
    },
    doneFunction: () => {
        return streamStore.done;
    },
    ownerInput: () => {
        return streamStore.singleInput.owner;
    },
    repoSlugInput: () => {
        return streamStore.singleInput.repo_slug;
    },
    userInput: () => {
        return streamStore.singleInput.user;
    },
    passwordInput: () => {
        return streamStore.singleInput.password;
    }
};

module.exports = {
    stream
}

/* function setStreamConfig(object) {
    // todo: validate fields
    global.stream = object;
}

function getEventWriter() {
    return getStreamConfig().eventWriter;
}

function getStanzaName() {
    return getStreamConfig().global.stream.name;
}

function getDoneFunction() {
    return getStreamConfig().global.stream.done;
}

function getOwner() {
    return getSingleInput().owner;
}

function getRepositoryName() {
    return getSingleInput().repo_slug
}

// utils

function getStreamConfig() {
    return global.stream;
}

function getSingleInput() {
    return getStreamConfig().singleInput;
}

module.exports = {
    setStreamConfig,    
    getEventWriter,
    getStanzaName,
    getDoneFunction,
    getOwner,
    getRepositoryName,
}*/