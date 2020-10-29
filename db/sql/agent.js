function sql () {};

sql.prototype.getAgentList = function () {
    let stringQuery = "SELECT name, description, os, version, status, create_at, update_at ";
    stringQuery += " FROM monitoring.agent";
    return stringQuery
};

sql.prototype.getSingleAgent= function () {
    let stringQuery = "SELECT * ";
    stringQuery += " FROM monitoring.agent";
    stringQuery += " WHERE name=? ALLOW FILTERING"
    return stringQuery
};

sql.prototype.insertAgent= function () {
    let stringQuery = "INSERT INTO monitoring.agent "
    stringQuery += "(id,name,description,os,version,status,address,jwt,create_at) ";
    stringQuery += "VALUES (?,?,?,?,?,?,?,?,toTimestamp(now()))";
    return stringQuery
}

sql.prototype.updatetAgent= function(id) {
    let stringQuery = "UPDATE monitoring.agent ";
    stringQuery += "SET "
    stringQuery += "description=?, os=?, version=?, address=?, update_at=toTimestamp(now()) ";
    stringQuery += "WHERE id ="+id;
    return stringQuery
}

sql.prototype.updatetAgentStatus= function(id) {
    let stringQuery = "UPDATE monitoring.agent ";
    stringQuery += "SET "
    stringQuery += "status=?, update_at=toTimestamp(now()) ";
    stringQuery += "WHERE id ="+id;
    return stringQuery
}

sql.prototype.deleteAgent= function() {
    let stringQuery = "DELETE FROM monitoring.agent ";
    stringQuery += "WHERE id =?";
    return stringQuery
}

module.exports = sql;