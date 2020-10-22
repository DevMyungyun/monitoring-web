var sql = () => {
};

sql.getResourceList = () => {
    let stringQuery = "SELECT * ";
    stringQuery += " FROM monitoring.resource";
    stringQuery += " ";
    stringQuery += " LIMIT ? ";
    return stringQuery
};

sql.getSingleResource= () => {
    let stringQuery = "SELECT * ";
    stringQuery += " FROM monitoring.resource";
    stringQuery += " WHERE aid = ?";
    stringQuery += " ORDER BY saved_at DESC";
    stringQuery += " LIMIT ?"
    return stringQuery
};

sql.insertResource= () => {
    let stringQuery = "INSERT INTO monitoring.resource "
    stringQuery += "(id,aid,cpu,memory,disk,saved_at) ";
    stringQuery += "VALUES (?,?,?,?,?,toTimestamp(now()))";
    return stringQuery
}

sql.getTotalCountResource= () => {
    let stringQuery = "SELECT COUNT(*) ";
    stringQuery += " FROM monitoring.resource";
    return stringQuery
};

module.exports = sql;