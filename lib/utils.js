/**
 * Created by Carlos on 10/11/15.
 */

var utils = module.exports = {

    registerModels: function(app, mongoose){
        console.log('utils.js: Registering models');

        require('../models/image')(app, mongoose);

        console.log("utils.js: 'Image' model registered");
    }
}