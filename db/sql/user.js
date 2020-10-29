function sql () {};

sql.prototype.getUserList = function () {
    let stringQuery = "SELECT * ";
    stringQuery += " FROM monitoring.users";
    return stringQuery
};

sql.prototype.getSingleUser = function () {
    let stringQuery = "SELECT * ";
    stringQuery += " FROM monitoring.users";
    stringQuery += " WHERE email=? ALLOW FILTERING"
    return stringQuery
};

sql.prototype.insertUser = function () {
    let stringQuery = "INSERT INTO monitoring.users "
    stringQuery += "(id,name,email,password,create_at) ";
    stringQuery += "VALUES (uuid(),?,?,?,toTimestamp(now()))";
    return stringQuery
}

sql.prototype.updatetUser = function(id) {
    let stringQuery = "UPDATE monitoring.users ";
    stringQuery += "SET "
    stringQuery += "email=?, password=?, update_at=toTimestamp(now()) ";
    stringQuery += "WHERE id ="+id;
    return stringQuery
}

sql.prototype.deleteUser = function(id) {
    let stringQuery = "DLETE FROM monitoring.users ";
    stringQuery += "WHERE id ="+id;
    return stringQuery
}

module.exports = sql;