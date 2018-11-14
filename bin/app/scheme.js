const splunkjs = require('splunk-sdk');

const ModularInputs = splunkjs.ModularInputs;
const Scheme = ModularInputs.Scheme;
const Argument = ModularInputs.Argument;

module.exports = () => {

    var scheme = new Scheme("Bitbucket pull requests");

        scheme.description = "Transforma la informacion asociada a los pull requests de un repositorio de Bitbucket en eventos indexables de Splunk.";
        scheme.useExternalValidation = false;  
        scheme.useSingleInstance = false;

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
                description: "El usuario con el que se inicia sesión en bitbucket y que tiene acceso al repositorio del dueño",
                requiredOnCreate: true,
                requiredOnEdit: false
            }),
            new Argument({
                name: "password",
                dataType: Argument.dataTypeString,
                description: "La contraseña de tu usuario",
                requiredOnCreate: true,
                requiredOnEdit: false
            }),
            new Argument({
                name: "hostname",
                dataType: Argument.dataTypeString,
                description: "El nombre del host de splunk enterprise",
                requiredOnCreate: true,
                requiredOnEdit: false
            }),
            new Argument({
                name: "port",
                dataType: Argument.dataTypeString,
                description: "El puerto del colector de eventos http de splunk",
                requiredOnCreate: true,
                requiredOnEdit: false
            }),
            new Argument({
                name: "token",
                dataType: Argument.dataTypeString,
                description: "El token de autenticacion del splunk para el colector de eventos",
                requiredOnCreate: true,
                requiredOnEdit: false
            })
        ];

        return scheme;
}
