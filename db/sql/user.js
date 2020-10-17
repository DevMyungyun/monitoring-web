var sql = () => {
};

sql.getUserList = () => {
    let stringQuery = "SELECT * ";
    stringQuery += " FROM monitoring.users";
    return stringQuery
};

sql.getSingleUser = () => {
    let stringQuery = "SELECT * ";
    stringQuery += " FROM monitoring.users";
    stringQuery += " WHERE email=? ALLOW FILTERING"
    return stringQuery
};

sql.insertUser = () => {
    let stringQuery = "INSERT INTO monitoring.users "
    stringQuery += "(id,name,email,password,create_at) ";
    stringQuery += "VALUES (uuid(),?,?,?,toTimestamp(now()))";
    return stringQuery
}

sql.updatetUser = (id) => {
    let stringQuery = "UPDATE monitoring.users ";
    stringQuery += "SET "
    stringQuery += "email=?, password=?, update_at=toTimestamp(now()) ";
    stringQuery += "WHERE id ="+id;
    return stringQuery
}

sql.deleteUser = (id) => {
    let stringQuery = "DLETE FROM monitoring.users ";
    stringQuery += "WHERE id ="+id;
    return stringQuery
}

module.exports = sql;