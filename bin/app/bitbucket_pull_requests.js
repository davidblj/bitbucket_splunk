(function() {

    var splunkjs        = require("splunk-sdk");
    var ModularInputs   = splunkjs.ModularInputs;
    var Logger          = ModularInputs.Logger;
    var Event           = ModularInputs.Event;
    var Scheme          = ModularInputs.Scheme;
    var Argument        = ModularInputs.Argument;

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
        let repository = singleInput.repository;

        Logger.info(name, "success !:" + username + "/" + repository);
        done();
    };

    ModularInputs.execute(exports, module);
})();
