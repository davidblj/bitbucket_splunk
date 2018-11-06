const date = require('./date');

function setAxiosDefaults(axios) {
    
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

module.exports = {
    buildQuery: buildQuery
}