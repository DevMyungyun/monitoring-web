var redis = require("redis"),
    client = redis.createClient( 6379 , '192.168.179.101' );
    client.auth("P@ssw0rd!");

// standard test
describe('App test!', function () {
  client.setex("item:abc", 100 ,"some val" , function( err , result ){
    console.log( "Resule: " );
    console.log( result );
}); 
});