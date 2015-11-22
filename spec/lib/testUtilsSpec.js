describe("testUtils - generate mock emotions data:", function() {
    var app = require('../../app');
    var ImageDB = require('../../controllers/images');
    var testUtils = require('../../lib/test/testUtils');

    var mockObj;

    beforeEach(function () {
        mockObj = testUtils.generateMockEmotionObj();
    });

    it("Must return an array", function() {
        expect(mockObj).toEqual(jasmine.any(Array));
    });

    it("The array must have an object in it", function() {
        expect(mockObj[0]).toEqual(jasmine.anything());
    });

    it("It must contain an object", function() {
        expect(mockObj[0]).toEqual(jasmine.any(Object));
    });

    it("The object must have faceRentangle property", function(){
        expect(mockObj[0].faceRectangle).toEqual(jasmine.anything());

    });

    it("The object must have scores property", function(){

        expect(mockObj[0].scores).toEqual(jasmine.anything());
    });

    it("faceRectangle property must have left, top, width and height", function(){
        expect(mockObj[0].faceRectangle.left).toEqual(jasmine.anything());
        expect(mockObj[0].faceRectangle.top).toEqual(jasmine.anything());
        expect(mockObj[0].faceRectangle.width).toEqual(jasmine.anything());
        expect(mockObj[0].faceRectangle.height).toEqual(jasmine.anything());

    });

    it("scores property must have anger, contempt, disgust, fear, happiness, neutral, " +
        "sadness and surprise", function(){
        console.log(mockObj[0].scores);
        expect(mockObj[0].scores.anger).toEqual(jasmine.anything());
        expect(mockObj[0].scores.contempt).toEqual(jasmine.anything());
        expect(mockObj[0].scores.disgust).toEqual(jasmine.anything());
        expect(mockObj[0].scores.fear).toEqual(jasmine.anything());
        expect(mockObj[0].scores.happiness).toEqual(jasmine.anything());
        expect(mockObj[0].scores.neutral).toEqual(jasmine.anything());
        expect(mockObj[0].scores.sadness).toEqual(jasmine.anything());
        expect(mockObj[0].scores.surprise).toEqual(jasmine.anything());

    });

    it("scores values must be between 0 and 1", function(){
        for (score in mockObj[0].scores) {
            expect(0 <= score <= 1).toBe(true);
        }

    });



});