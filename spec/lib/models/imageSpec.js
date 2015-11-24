/**
 * Created by Carlos on 23/11/15.
 */

var Utils     = require('../../../lib/utils');
var mongoose = require('mongoose')
var Image = mongoose.model('Image');

describe("READ operations:", function(){

    it("Image.find must return all images in database", function(done) {
        Image.find(function(err, images) {
            expect(err).toBe(null);
            expect(images).toEqual(jasmine.anything());
            done();
        });

    });
});

