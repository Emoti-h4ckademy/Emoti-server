var mongoose      = require('mongoose');
// Connection to DB
var connTest = mongoose.connect('mongodb://localhost/emotiTest', function(err, res) {
    if(err) throw err;
    console.log('Connected to Database');
});

utils.registerModels(app, mongoose);