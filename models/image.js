/**
 * Created by Carlos on 6/11/15.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var imageSchema = new Schema({
    username:    { type: String, required: true },
    ip:          { type: String, required: true },
    date:        { type: Date, required: true },
    image:       { type: String, required: true },
    emotions:    { type: String },
    mainemotion: { type: String}
});

module.exports = mongoose.model('Image', imageSchema);

