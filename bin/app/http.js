
function buildQuery(eventId) {

    let stateConstraint = "(state=\"OPEN\" OR state=\"MERGED\")";
    let pageLength = "pagelen=25";

    if (eventId) {
        
        let idConstraint = `id>${eventId}`;
        let query = encodeURIComponent(`${stateConstraint} AND ${idConstraint}`);
        let sortById = "sort=id";        

        return `pullrequests?q=${query}&${pageLength}&${sortById}`;    

    } else {

        let query = encodeURIComponent(`${stateConstraint}`);

        return `pullrequests?q=${query}&${pageLength}`;
    }
}

module.exports = {
    buildQuery: buildQuery
}