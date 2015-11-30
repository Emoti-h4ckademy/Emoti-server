/**
 * Created by Carlos on 10/11/15.
 */
var config = require('../config');


var utils = module.exports = {

    initializeDatabase: function(app, mongoose, callback){
        console.log("NODE_ENV = " + app.get('env'));
        var dbUrl;
        app.set('dbUrl', config.db[app.get('env')]);
        if(process.env.OPENSHIFT_MONGODB_DB_URL){
            dbUrl = process.env.OPENSHIFT_MONGODB_DB_URL + 'emoti';
        } else {
            dbUrl = app.get('dbUrl');
        }

        // Connection to DB
        mongoose.connect(dbUrl, {}, function(err, db) {
            if(err) {
                callback (err);
            }
            console.log('Connected to Database');
            app.set('db', db);
        });

        // CONNECTION EVENTS
        // When successfully connected
        mongoose.connection.on('connected', function () {
            console.log('Mongoose default connection open to ' + dbUrl);
        });

        // If the connection throws an error
        mongoose.connection.on('error',function (err) {
            console.log('Mongoose default connection error: ' + err);
        });

        // When the connection is disconnected
        mongoose.connection.on('disconnected', function () {
            console.log('Mongoose default connection disconnected');
        });

        mongoose.connection.on('close', function(){
            console.log("MongoDB connection lost");
            process.exit(1);
        });

        // If the Node process ends, close the Mongoose connection
        process.on('SIGINT', function() {
            mongoose.connection.close(function () {
                console.log('Mongoose default connection disconnected through app termination');
                process.exit(0);
            });
        });

        //Register models
        require('../models/image')(app, mongoose);
        console.log("utils.js: 'Image' model registered");
        callback (false);
    }
}