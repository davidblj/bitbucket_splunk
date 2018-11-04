const splunkjs = require('splunk-sdk');

const ModularInputs = splunkjs.ModularInputs;
const Scheme = ModularInputs.Scheme;
const Argument = ModularInputs.Argument;

module.exports = () => {

    var scheme = new Scheme("Bitbucket pull requests");

        scheme.description = "Transforma la informacion asociada a los pull requests de un repositorio de Bitbucket en eventos indexables de Splunk";
        scheme.useExternalValidation = false;  
        scheme.useSingleInstance = true;

        scheme.args = [
            new Argument({
                name: "owner",
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
            }),
            new Argument({
                name: "user",
                dataType: Argument.dataTypeString,
                description: "Tu usuario con el que inicias sesión en bitbucket y que tiene acceso al repositorio del dueño",
                requiredOnCreate: true,
                requiredOnEdit: false
            }),
            new Argument({
                name: "password",
                dataType: Argument.dataTypeString,
                description: "La contraseña de tu usuario",
                requiredOnCreate: true,
                requiredOnEdit: false
            })
        ];

        return scheme;
}
