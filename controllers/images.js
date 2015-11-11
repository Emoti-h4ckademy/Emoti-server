/**
 * Created by Carlos on 6/11/15.
 */
var Image = require('mongoose').model('Image');

//GET - Return all images in the DB
exports.findAllImages = function(req, res) {
    Image.find(function(err, images) {
        if(err) res.send(500, err.message);

        console.log('GET /images')
        res.status(200).jsonp(images);
    });
};

exports.returnAllImages = function(callback) {
    Image.find(function(err, images) {
       // if(err) res.send(500, err.message);

        console.log('returnAllImages');
        console.log(images);

        if (err) {
            throw Error;
        }
        callback( null, images);
    });
};

exports.findOneImage = function(req, res) {
    Image.find(function(err, images) {
        if(err) res.send(500, err.message);

        console.log('GET /images')
        res.status(200).jsonp(images);
    });
};

/*
//GET - Return an image with specified ID
exports.findImageById = function(req, res) {
    Image.findById(req.params.id, function(err, image) {
        if(err) return res.send(500, err.message);

        console.log('GET /images/' + req.params.id);
        res.status(200).jsonp(image);
    });
};*/

//POST - Insert a new image in the DB
exports.addImage = function(req, res) {
    console.log('POST');
    console.log(req.body);

    console.log("Client IP 1 : " + req.connection.remoteAddress);
    console.log("Client IP 2 : " + req.ip);

    var image = new Image({
        ip:     req.connection.remoteAddress,
        date:   new Date(),
        image: 	req.body.image
    });

    image.save(function(err, image) {
        if(err) return res.send(500, err.message);
        res.status(200).jsonp(image);
    });

    console.log('POST /images')
};

