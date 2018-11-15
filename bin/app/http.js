const date = require('./date');
const config = require('./config');
const logger = require('./logger');

const axios = require('axios');
const btoa = require('btoa');

const stream = config.stream;

// getAxios
function getAxiosBitbucketInstance() {    

    let instance = axios.create({
            baseURL: `https://api.bitbucket.org/2.0/repositories/${stream.ownerInput()}/${stream.repoSlugInput()}/`,
        });

    let encondedAuthentication = btoa(`${stream.userInput()}:${stream.passwordInput()}`);
    instance.defaults.headers.common['Authorization'] = `Basic ${encondedAuthentication}`;

    return instance;
}

function getAxiosEventCollectorInstance() {

    let instance = axios.create({
        baseURL: `http://${stream.hostnameInput()}:${stream.portInput()}/services/collector/event`
    });

    instance.defaults.headers.common['Authorization'] = `Splunk ${stream.tokenInput()}`;
    instance.defaults.headers.common['Content-Type'] = 'text/plain';

    return instance;
}

function buildQuery(eventId) {

    let stateConstraint = "(state=\"OPEN\" OR state=\"MERGED\" OR state=\"DECLINED\")";
    let dateConstraint = `created_on > ${date.snapMonthsTo(2)}`;
    let globalQuery = `${stateConstraint} AND ${dateConstraint}`;

    let fieldsToAdd = encodeURIComponent("+values.participants");
    let fieldsToTrim = encodeURIComponent("-values.description,-values.self,-values.summary");
    let fields = `fields=${fieldsToAdd},${fieldsToTrim}`;
    
    let pageLength = "pagelen=25";

    if (eventId) {
        
        let idConstraint = `id>${eventId}`;
        let query = encodeURIComponent(`${globalQuery} AND ${idConstraint}`);
        let sortById = "sort=id";        

        return `pullrequests?q=${query}&${pageLength}&${sortById}&${fields}`;    

    } else {

        let query = encodeURIComponent(`${globalQuery}`);

        return `pullrequests?q=${query}&${pageLength}&${fields}`;
    }
}

function handleHttpError(error) {

    if (error.response) {  

        logger.error(`data: ${JSON.stringify(error.response.data)} 
                     \n status: ${error.response.status} 
                     \n headers: ${JSON.stringify(error.response.headers)}`);            

    } else if (error.request) {            

        logger.error(`no server response: ${JSON.stringify(error.request)}`);            

    } else {

        logger.error(`configuration not set properly: ${error.message}`);           
    }

    logger.error(`axios request failed. request configuration is: ${JSON.stringify(error.config)}`);      
}

module.exports = {
    buildQuery,
    getAxiosBitbucketInstance,
    getAxiosEventCollectorInstance,
    handleHttpError
}
