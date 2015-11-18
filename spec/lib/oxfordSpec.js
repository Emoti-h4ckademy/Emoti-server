describe("Oxford - recognizeImageB64", function() {
    var app = require('../../app');
    var ImageDB = require ('../../controllers/images')
    var http = require('http');
    
    var Oxford;
    
    beforeEach(function(){
       Oxford = require('../../lib/oxford'); 
    });
    
    it("Check empty image", function() {
        Oxford.recognizeImageB64(null, function (error, emotionString) {
            expect(error).toBeFalsy();
        });
    });
    
    it("Check invalid license", function() {
        Oxford.oxfordApiKey = "Invalid";

        Image = ImageDB.returnOneImage( function () {
            Oxford.recognizeImageB64(Image.image, function (error, emotionString) {
                expect(error).toBeTruthy();
            });
        });
    });
    
    it("Check invalid url", function() {
        Oxford.oxfordUrl = "http://www.hackademy.com";
        
        Image = ImageDB.returnOneImage( function () {
            Oxford.recognizeImageB64(Image.image, function (error, emotionString) {
                expect(error).toBeTruthy();
            });
        });
    });
    
    it("Check empty emotionString when the an error is found", function() {
        Oxford.recognizeImageB64(null, function (error, emotionString) {
            expect(emotionString).toEqual("{}");
        });
    });
});

describe("Oxford - Parse response", function() {
    var app = require('../../app');
    var http = require('http');
    var httpMocks = require('node-mocks-http');
    
    var Oxford;
    var response;
    
    beforeEach(function(){
        Oxford = require('../../lib/oxford');
        response = httpMocks.createResponse();  
    });
    
    it("Check parser with empty response", function() {
       Oxford._oxfordParseResponse(null, function (error, emotionString) {
           expect(error).toBeTruthy();
       }) 
    });
    
    it("Check error status code 200", function () {
        response.statusCode = 200;
        
        Oxford._oxfordParseResponse(response, function (error, emotionString) {
           expect(error).toBeFalsy();
        });
    });
    
    //400: Indicates JSON parsing error, faceRectangles cannot be parsed correctly, or count exceeds 64, or content-type is not recognized.
    //{ "statusCode": 401, "message": "Access denied due to invalid subscription key. Make sure you are subscribed to an API you are trying to call and provide the right key." }
    //{ "statusCode": 403, "message": "Out of call volume quota. Quota will be replenished in 2.12 days." }
    //{ "statusCode": 429, "message": "Rate limit is exceeded. Try again in 26 seconds." }

    it("Check wrong status code", function () {
        var errorCodes = [404, 400, 401, 403, 429];
        
        for (var index = 0; index < errorCodes.length; index++) {
            response.statusCode = errorCodes[index];
            Oxford._oxfordParseResponse(response, function (error, emotionString) {
                expect(error).toBeTruthy();
            });
        }
    });

});