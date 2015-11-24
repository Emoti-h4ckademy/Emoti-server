/**
 * Created by Carlos on 6/11/15.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var imageSchema = new Schema({
    username:    { type: String },
    ip:          { type: String },
    date:        { type: Date},
    image:       { type: String },
    emotions:    { type: String },
    mainemotion: { type: String}
});

module.exports = mongoose.model('Image', imageSchema);

