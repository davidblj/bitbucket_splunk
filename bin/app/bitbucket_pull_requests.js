

(function() {

    const splunkjs        = require("splunk-sdk");
    const bitbucket       = require("bitbucket")

    const ModularInputs   = splunkjs.ModularInputs;
    const Logger          = ModularInputs.Logger;
    const Event           = ModularInputs.Event;
    const Scheme          = ModularInputs.Scheme;
    const Argument        = ModularInputs.Argument;

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

        try {

            // let { data, headers } = await bitbucket.pullrequests.list({repo_slug, username})

            // todo: log all of our repositories
            Logger.info(name, "successfull response")
            // Logger.info(name, data.pagelen)
            done();

        } catch (e) {

            // todo: log error
            Logger.error(name, "error fetching information");
            done(e)
        }        
    };

    ModularInputs.execute(exports, module);
})();
