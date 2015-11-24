describe("testUtils - generate mock emotions object:", function() {
    //var app = require('../../app');
   // var ImageDB = require('../../controllers/images');
    var testUtils = require('../../lib/test/testUtils');

    var responseMock,
        mockObj;

    beforeEach(function () {
        responseMock = testUtils.generateMockEmotionsArray();
        mockObj = responseMock[0];
    });

    it("Response generated from generateMockEmotionsArray must be an array", function() {
        expect(responseMock).toEqual(jasmine.any(Array));
    });

    it("The array must not be empty", function() {
        expect(responseMock[0]).toEqual(jasmine.anything());
    });

    it("The array must contain an Object", function() {
        expect(responseMock[0]).toEqual(jasmine.any(Object));
    });

    it("The object must have faceRentangle property", function(){
        expect(mockObj.faceRectangle).toEqual(jasmine.anything());

    });

    it("The object must have scores property", function(){

        expect(mockObj.scores).toEqual(jasmine.anything());
    });

    it("faceRectangle property must have left, top, width and height", function(){
        expect(mockObj.faceRectangle.left).toEqual(jasmine.anything());
        expect(mockObj.faceRectangle.top).toEqual(jasmine.anything());
        expect(mockObj.faceRectangle.width).toEqual(jasmine.anything());
        expect(mockObj.faceRectangle.height).toEqual(jasmine.anything());

    });

    it("scores property must have anger, contempt, disgust, fear, happiness, neutral, " +
        "sadness and surprise", function(){
        expect(mockObj.scores.anger).toEqual(jasmine.anything());
        expect(mockObj.scores.contempt).toEqual(jasmine.anything());
        expect(mockObj.scores.disgust).toEqual(jasmine.anything());
        expect(mockObj.scores.fear).toEqual(jasmine.anything());
        expect(mockObj.scores.happiness).toEqual(jasmine.anything());
        expect(mockObj.scores.neutral).toEqual(jasmine.anything());
        expect(mockObj.scores.sadness).toEqual(jasmine.anything());
        expect(mockObj.scores.surprise).toEqual(jasmine.anything());

    });

    it("scores values must be between 0 and 1", function(){
        for (score in mockObj.scores) {
            expect(0 <= score <= 1).toBe(true);
        }

    });



});

describe("testUtils - generate mock emotions database document:", function() {
    var testUtils = require('../../lib/test/testUtils');

    it("generateMockImageDBdoc must return an object", function () {
        var imageDoc = testUtils.generateMockImageDBdoc ();
        expect(imageDoc).toEqual(jasmine.any(Object));
    });

    it("Document must have username, ip, date, image, emotions and mainemotion", function () {
        var imageDoc = testUtils.generateMockImageDBdoc ();
        expect(typeof imageDoc.username).toBe('string');
        expect(typeof imageDoc.ip).toBe('string');
        expect(imageDoc.date instanceof Date).toBe(true);
        expect(typeof imageDoc.image).toBe('string');
        expect(typeof imageDoc.emotions).toBe('string');
        expect(typeof imageDoc.mainemotion).toBe('string');
    });

});

describe("Test generateMultipleDBdocs", function(){
    var testUtils = require('../../lib/test/testUtils');

    it("It should return an array", function(){
        var result = testUtils.generateMultipleDBdocs();
        expect(result).toEqual(jasmine.any(Array));

    });

    it("It should return an array with the same length as the number passed as an argument", function(){
        var number = 5;
        var result = testUtils.generateMultipleDBdocs(number);
        expect(result.length).toEqual(number);

    });

    it("It must save in database a specified number of documents", function(done){
        var number = 10;
        var result = testUtils.generateMultipleDBdocs(number, true);
        expect(result.length).toEqual(number);
    });

});
