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
        return streamStore.singleInput.repository;
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
