var sql = () => {
};

sql.getAgentist = () => {
    let stringQuery = "SELECT name, description, os, version, TODATE(create_at) as create_at, update_at ";
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
    stringQuery += "(id,name,description,os,version,jwt,create_at) ";
    stringQuery += "VALUES (?,?,?,?,?,?,toTimestamp(now()))";
    return stringQuery
}

sql.updatetAgent= (id) => {
    let stringQuery = "UPDATE monitoring.agent ";
    stringQuery += "SET "
    stringQuery += "name=?, description=?, os=?, version=?, jwt=?, update_at=toTimestamp(now()) ";
    stringQuery += "WHERE id ="+id;
    return stringQuery
}

sql.deleteAgent= (id) => {
    let stringQuery = "DLETE FROM monitoring.agent ";
    stringQuery += "WHERE id ="+id;
    return stringQuery
}

module.exports = sql;