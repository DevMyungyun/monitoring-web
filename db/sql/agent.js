var sql = () => {
};

sql.getAgentList = () => {
    let stringQuery = "SELECT name, description, os, version, status, TODATE(create_at) as create_at, TODATE(update_at) as update_at ";
    stringQuery += " FROM monitoring.agent";
    return stringQuery
};

sql.getSingleAgent= () => {
    let stringQuery = "SELECT * ";
    stringQuery += " FROM monitoring.agent";
    stringQuery += " WHERE name=? ALLOW FILTERING"
    return stringQuery
};

sql.insertAgent= () => {
    let stringQuery = "INSERT INTO monitoring.agent "
    stringQuery += "(id,name,description,os,version,status,address,jwt,create_at) ";
    stringQuery += "VALUES (?,?,?,?,?,?,?,?,toTimestamp(now()))";
    return stringQuery
}

sql.updatetAgent= (id) => {
    let stringQuery = "UPDATE monitoring.agent ";
    stringQuery += "SET "
    stringQuery += "description=?, os=?, version=?, address=?, update_at=toTimestamp(now()) ";
    stringQuery += "WHERE id ="+id;
    return stringQuery
}

sql.updatetAgentStatus= (id) => {
    let stringQuery = "UPDATE monitoring.agent ";
    stringQuery += "SET "
    stringQuery += "status=?, update_at=toTimestamp(now()) ";
    stringQuery += "WHERE id ="+id;
    return stringQuery
}

sql.deleteAgent= () => {
    let stringQuery = "DELETE FROM monitoring.agent ";
    stringQuery += "WHERE id =?";
    return stringQuery
}

module.exports = sql;