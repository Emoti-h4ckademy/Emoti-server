/**
 * Created by Carlos on 23/11/15.
 */
var Utils     = require('../../../lib/utils');
var mongoose = require('mongoose')
var ImageCtrl = require('../../../controllers/images');

describe("Test returnAllImages:", function(){

    it("It returns all images in database", function(done) {
        ImageCtrl.returnAllImages(function(err, images) {
            expect(err).toBe(null);
            expect(images).toEqual(jasmine.anything());
            done();
        });

    });
});

/*describe("Update database; ", function(){

});*/
