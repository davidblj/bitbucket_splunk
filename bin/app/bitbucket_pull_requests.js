const splunkjs = require("splunk-sdk");
const axios = require('axios');

const ModularInputs = splunkjs.ModularInputs;
const Logger = ModularInputs.Logger;
const Event = ModularInputs.Event;
const Scheme = ModularInputs.Scheme;
const Argument = ModularInputs.Argument;

(function() {

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

    /*exports.validateInput = function(definition, done) {
        var count = parseInt(definition.parameters.count, 10);
        // done() or done(error)
    };*/

    exports.streamEvents = function(name, singleInput, eventWriter, done) {

        let username = singleInput.username;
        let repo_slug = singleInput.repository;

        axiosConfig()

        axios.get(`repositories/davidblj/testing/pullrequests`)
            .then(handleResponse(name, done))
            .catch(handleError(name, done))        
    };

    ModularInputs.execute(exports, module);
})();


function axiosConfig() {
    axios.defaults.baseURL = 'https://api.bitbucket.org/2.0/';
}

function handleResponse(name, done) {
    
    return (response) => {

        Logger.info(name, `this function is a success. Page length is: ${response.data.pagelen}`);
        done(); 
    }
}

function handleError(name, done) {

    return (error) => {

        if (error.response) {

            Logger.error(name, `data: ${error.response.data} \n
                                status: ${error.response.status} \n
                                headers: ${error.response.headers}`)            
        } else if (error.request) {            
            Logger.error(name, `no server response: ${JSON.stringify(error.request)}`)            
        } else {
            Logger.error(name, `configuration not set properly: ${error.message}`)           
        }

        Logger.error(name, `config log: ${JSON.stringify(error.config)}`)                
        done(error)
    }
}
