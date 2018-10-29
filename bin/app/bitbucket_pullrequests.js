
const splunkjs      = require("splunk-sdk");

let ModularInputs   = splunkjs.ModularInputs;
let Logger          = ModularInputs.Logger;
let Event           = ModularInputs.Event;
let Scheme          = ModularInputs.Scheme;
let Argument        = ModularInputs.Argument;

(function() {

    // other global variables here

    // getScheme method returns introspection scheme
    exports.getScheme = function() {
        var scheme = new Scheme("My Modular Input");

        // scheme properties
        scheme.description = "A modular input.";
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
        var arg = parseFloat(definition.parameters.arg);
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
        // modular input logic goes here
        var getMyArgument = function (arg) {
            return arg;
        };

        // local variables here
        var arg = parseFloat(singleInput.arg);
        var count = parseInt(singleInput.count, 10);
        var errorFound = false;

        // stream as many events as specified by the count parameter
        for (var i = 0; i < count && !errorFound; i++) {            
            var curEvent = new Event({
                stanza: name,
                data: "argument=" + getArgument(arg)
            });

            try {
                eventWriter.writeEvent(curEvent);
            }
            catch (e) {
                errorFound = true; // Make sure we stop streaming if there's an error at any point
                Logger.error(name, e.message);
                done(e);

                // we had an error; die
                return;
            }
        }

        // streaming is done
        done();
    };

    ModularInputs.execute(exports, module);
})();
