/**
 * Created by Carlos on 10/11/15.
 */

var utils = module.exports = {

    initializeDatabase: function(app, mongoose){

        // Connection to DB
        var conn = mongoose.connect('mongodb://localhost/emoti', function(err, res) {
            if(err) throw err;
            console.log('Connected to Database');
        });

        console.log('utils.js: Registering models');

        require('../models/image')(app, mongoose);

        console.log("utils.js: 'Image' model registered");
    }
}