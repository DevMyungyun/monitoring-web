function sql () {};

sql.prototype.getResourceList = function () {
    let stringQuery = "SELECT * ";
    stringQuery += " FROM monitoring.resource";
    stringQuery += " ";
    stringQuery += " LIMIT ? ";
    return stringQuery
};

sql.prototype.getSingleResource= function () {
    let stringQuery = "SELECT * ";
    stringQuery += " FROM monitoring.resource";
    stringQuery += " WHERE aid = ? ";
    stringQuery += " AND saved_at <= toTimeStamp(now()) and saved_at>=? "
    stringQuery += " ORDER BY saved_at DESC";
    return stringQuery
};

sql.prototype.insertResource= function () {
    let stringQuery = "INSERT INTO monitoring.resource "
    stringQuery += "(id,aid,cpu,memory,disk,saved_at) ";
    stringQuery += "VALUES (?,?,?,?,?,toTimestamp(now()))";
    return stringQuery
}

sql.prototype.getTotalCountResource= function () {
    let stringQuery = "SELECT COUNT(*) ";
    stringQuery += " FROM monitoring.resource";
    return stringQuery
};

module.exports = sql;