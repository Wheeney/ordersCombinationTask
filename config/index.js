/**
 * Load module dependencies
 */
var env = process.env;

var PORT = env.PORT || 9999;
var MONGODB_URL = env.MONGODB_URL || 'mongodb://127.0.0.1:27017/orders';
var HOST = 'localhost';

module.exports = {
    PORT : PORT,
    HOST : HOST,

    //MongoDb URL
    MONGODB:{
        URL:MONGODB_URL,
        OPTS:{
            server:{
                auto_reconnect:true
            }
        }
    }
    

};