/**
 * Created by Carlos on 23/11/15.
 */
var ImageCtrl = require('../../../controllers/images');
var TestUtils = require('../../../lib/test/testUtils');

var singleDoc = TestUtils.generateMultipleDBdocs(1)[0];

describe("READ operations", function(){

    it("getImagesStoredWithEmotions must return all images in database", function(done) {
        ImageCtrl.getImagesStoredWithEmotions(0, function(error, allImages){
            expect(error).toBe(null);
            expect(allImages).toEqual(jasmine.anything());
            done();
        });
    });
});


describe("CREATE operations", function(){

    beforeAll(function(){

    });

    it("addMockImage should not crash with undefined argument", function(done) {

        ImageCtrl.addMockImage(undefined, function(error, allImages){
            expect(allImages).toBe(undefined);
            expect(error).toEqual(jasmine.anything());
            done();
        });
    });

    it("addMockImage must return all images in database", function(done) {

        ImageCtrl.addMockImage(singleDoc, function(error, allImages){
            expect(error).toBe(null);
            expect(allImages).toEqual(jasmine.anything());
            done();
        });
    });
});



/*describe("Update database; ", function(){

});*/
