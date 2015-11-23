/**
 * Created by Carlos on 23/11/15.
 */

var Utils     = require('../../../lib/utils');
var mongoose = require('mongoose')
var Image = mongoose.model('Image');

describe("Test find images:", function(){

    it("It return all images in database", function(done) {
        Image.find(function(err, images) {
            expect(err).toBe(null);
            expect(images).toEqual(jasmine.anything());
            done();
        });

    });
});

describe("Update database; ", function(){

});

