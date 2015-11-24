/**
 * Created by Carlos on 10/11/15.
 */

var utils = module.exports = {

    initializeDatabase: function(app, mongoose, callback){
        console.log("We are in environment: " + app.get('env'));
        var defaultDBPath = 'mongodb://localhost/emoti';
        var demoDBPath = 'mongodb://localhost/emotiTest';
        var modelPath = '../models/image';

        var connString = (app.get('env') === 'demo') ? demoDBPath : defaultDBPath;


        // Connection to DB
        var conn = mongoose.connect(connString, function(err, res) {
            if(err) {
                callback (err);
            }
            console.log('Connected to Database');
        });
        app.set('db', conn);

        //mongoose.connect(connString);

        //Register models
        console.log('utils.js: Registering models');
        require(modelPath)(app, mongoose);
        console.log("utils.js: 'Image' model registered");
        callback (false);
    }
}