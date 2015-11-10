/**
 * Created by Carlos on 6/11/15.
 */

exports = module.exports = function(app, mongoose) {

    var ImageSchema = new mongoose.Schema({
        ip: 		{ type: String },
        date:       { type: Date},
        image: 		{ type: Buffer }
    });

    mongoose.model('Image', ImageSchema);

};


