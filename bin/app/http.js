const date = require('./date');
const axios = require('axios');
const btoa = require('btoa');
const config = require('./config');
const logger = require('./logger');

const stream = config.stream;

function getAxiosInstance() {    

    let instance = axios.create({
            baseURL: `https://api.bitbucket.org/2.0/repositories/${stream.ownerInput()}/${stream.repoSlugInput()}/`,
        });

    let encondedAuthentication = btoa(`${stream.userInput()}:${stream.passwordInput()}`);
    instance.defaults.headers.common['Authorization'] = `Basic ${encondedAuthentication}`;

    return instance;
}

function buildQuery(eventId) {

    let stateConstraint = "(state=\"OPEN\" OR state=\"MERGED\" OR state=\"DECLINED\")";
    let dateConstraint = `created_on > ${date.snapMonthsTo(2)}`;
    let globalConstraint = `${stateConstraint} AND ${dateConstraint}`;

    let pageLength = "pagelen=25";

    if (eventId) {
        
        let idConstraint = `id>${eventId}`;
        let query = encodeURIComponent(`${globalConstraint} AND ${idConstraint}`);
        let sortById = "sort=id";        

        return `pullrequests?q=${query}&${pageLength}&${sortById}`;    

    } else {

        let query = encodeURIComponent(`${globalConstraint}`);

        return `pullrequests?q=${query}&${pageLength}`;
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
    getAxiosInstance,
    handleHttpError
}