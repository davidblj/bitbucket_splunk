(function() {
    var splunkjs        = require("splunk-sdk");
    var ModularInputs   = splunkjs.ModularInputs;
    var Logger          = ModularInputs.Logger;
    var Event           = ModularInputs.Event;
    var Scheme          = ModularInputs.Scheme;
    var Argument        = ModularInputs.Argument;
    // other global variables here

    // getScheme method returns introspection scheme
    exports.getScheme = function() {
        var scheme = new Scheme("Bitbucket pull requests");

        // scheme properties
        scheme.description = "Streaming de pull requests";
        scheme.useExternalValidation = true;  // if true, must define validateInput method
        scheme.useSingleInstance = true;      // if true, all instances of mod input passed to
                                              //   a single script instance; if false, user 
                                              //   can set the interval parameter under "more settings"

        // add arguments
        scheme.args = [
            new Argument({
                name: "arg",
                dataType: Argument.dataTypeNumber,
                description: "An argument.",
                requiredOnCreate: true,
                requiredOnEdit: false
            }),
            new Argument({
                name: "count",
                dataType: Argument.dataTypeNumber,
                description: "A counter.",
                requiredOnCreate: true,
                requiredOnEdit: false
            })
            // other arguments here
        ];

        return scheme;
    };

    // validateInput method validates the script's configuration (optional)
    exports.validateInput = function(definition, done) {
        // local variables here
        var count = parseInt(definition.parameters.count, 10);

        // error checking goes here
	    if (count < 0) {
            done(new Error("The count was a negative number."));
        }
        else {
            done();
        }
    };

    // streamEvents streams the events to Splunk Enterprise
    exports.streamEvents = function(name, singleInput, eventWriter, done) {

        Logger.info(name, "success !");

        // local variables here
        var arg = parseInt(singleInput.arg);
        var count = parseInt(singleInput.count, 10);
        var errorFound = false;

        // streaming is done
        done();
    };

    ModularInputs.execute(exports, module);
})();
