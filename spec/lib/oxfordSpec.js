describe("Oxford - recognizeImageB64:", function() {
    var ImageDB = require ('../../controllers/images');
    var http = require('http');
    
    var Oxford;
    
    beforeEach(function(){
       Oxford = require('../../lib/oxford');

    });
    
    it("Check empty image", function() {
        Oxford.recognizeImageB64(null, function (error, emotionString) {
            expect(error).toBeTruthy();
        });
    });
    
    it("Check invalid license", function(done) {
        Oxford.oxfordApiKey = "Invalid";

        Oxford.recognizeImageB64("myimg", function (error, emotionString) {
            expect(error).toBeTruthy();
            done();
        });
    });
    
    it("Check invalid url", function(done) {
        Oxford.oxfordUrl = "http://www.hackademy.com";
        
        Oxford.recognizeImageB64("myimg", function (error, emotionString) {
            expect(error).toBeTruthy();
            done();
        });
    });
    
    it("Check empty emotionString when the an error is found", function() {
        Oxford.recognizeImageB64(null, function (error, emotionString) {
            expect(emotionString).toEqual("[]");
        });
    });
});

describe("Oxford - Parse response:", function() {
    var http = require('http');
    var httpMocks = require('node-mocks-http');
    
    var Oxford;
    var response;
    
    beforeEach(function(){
        Oxford = require('../../lib/oxford');
        response = httpMocks.createResponse();  
    });
    
    it("Check parser with empty response", function() {
       Oxford._parseResponse(null, function (error, emotionString) {
           expect(error).toBeTruthy();
       }) 
    });
    
    it("Check error status code 200", function () {
        response.statusCode = 200;
        
        Oxford._parseResponse(response, function (error, emotionString) {
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
            Oxford._parseResponse(response, function (error, emotionString) {
                expect(error).toBeTruthy();
                expect(emotionString).toEqual("[]");
            });
        }
    });
    
    it("Valid response without faces found", function () {
        response.statusCode = 200;
        response.body = "[]";
        
        Oxford._parseResponse(response, function (error, emotionString) {
            expect(error).toBeFalsy();
            expect(emotionString).toEqual("[]");
        });
    });
    
    it("Valid response with 1 face found", function () {
        response.statusCode = 200;
        response.body = '[{"faceRectangle":{"height":330,"left":496,"top":380,"width":330},"scores":{"anger":0.00049562176,"contempt":0.00944269449,"disgust":0.000420141238,"fear":0.000741298136,"happiness":0.00104544382,"neutral":0.924679339,"sadness":0.0628001,"surprise":0.000375334261}}]';
        
        Oxford._parseResponse(response, function (error, emotionString) {
            expect(error).toBeFalsy();
            expect(emotionString).toEqual(response.body);
        });
    });
    
    it("Valid response with 2 faces found", function () {
        response.statusCode = 200;
        response.body = '[{"faceRectangle":{"height":246,"left":682,"top":358,"width":246},"scores":{"anger":0.00117260928,"contempt":0.02137477,"disgust":0.00197244668,"fear":0.00125437335,"happiness":0.02501212,"neutral":0.8821156,"sadness":0.06600666,"surprise":0.00109143171}},{"faceRectangle":{"height":158,"left":396,"top":363,"width":158},"scores":{"anger":7.11420569E-07,"contempt":0.001118677,"disgust":1.47923924E-06,"fear":3.15374564E-06,"happiness":0.06511541,"neutral":0.932194948,"sadness":0.00139758235,"surprise":0.000168059792}}]';
        
        Oxford._parseResponse(response, function (error, emotionString) {
            expect(error).toBeFalsy();
            expect(emotionString).toEqual(response.body);
        });
    });
    
});

describe("Oxford - Extract main emotion:", function() {
    var Oxford;
    var response;
    
    beforeEach(function(){
        Oxford = require('../../lib/oxford');
    });
    
    it("Emotion should be empty with undefined", function () {
        response = undefined;
        var emotion = Oxford.extractMainEmotion(response);
        expect (emotion).toEqual(Oxford.emptyEmotion);
    });
    
    it("Emotion should be empty with emptyResponse", function () {
        response = Oxford.emptyResponse;
        var emotion = Oxford.extractMainEmotion(response);
        expect (emotion).toEqual(Oxford.emptyEmotion);
    });
    
    it("Emotion should be neutral", function () {
        response = '[{"faceRectangle":{"height":277,"left":254,"top":236,"width":277},"scores":{"anger":0.00221836031,"contempt":0.03048508,"disgust":0.000540671,"fear":0.000141272656,"happiness":0.0510304645,"neutral":0.913147569,"sadness":0.00144952093,"surprise":0.0009870367}}]'
        var emotion = Oxford.extractMainEmotion(response);
        var finalemotion = emotion.emotion;
        expect (finalemotion).toEqual("neutral");
    });
    
    it("Should return emotion from face 0", function () {
        response = '[{"faceRectangle":{"height":277,"left":254,"top":236,"width":277},"scores":{"anger":0.00221836031,"contempt":0.03048508,"disgust":0.000540671,"fear":0.000141272656,"happiness":0.0510304645,"neutral":0.913147569,"sadness":0.00144952093,"surprise":0.0009870367}}]'
        var emotion = Oxford.extractMainEmotion(response, 0);
        var finalemotion = emotion.emotion;
        expect (finalemotion).toEqual("neutral");
    });
    
    it("Emotion should be empty when asking for emotion from a N-face that doesn't exist", function () {
        response = '[{"faceRectangle":{"height":277,"left":254,"top":236,"width":277},"scores":{"anger":0.00221836031,"contempt":0.03048508,"disgust":0.000540671,"fear":0.000141272656,"happiness":0.0510304645,"neutral":0.913147569,"sadness":0.00144952093,"surprise":0.0009870367}}]'
        var emotion = Oxford.extractMainEmotion(response, 1);
        expect (emotion).toEqual(Oxford.emptyEmotion);
    });
    
    it("Should return emotion from face 1", function () {
        response = '[{"faceRectangle":{"height":246,"left":682,"top":358,"width":246},"scores":{"anger":0.00117260928,"contempt":0.02137477,"disgust":0.00197244668,"fear":0.00125437335,"happiness":0.02501212,"neutral":0.8821156,"sadness":0.06600666,"surprise":0.00109143171}},{"faceRectangle":{"height":158,"left":396,"top":363,"width":158},"scores":{"anger":7.11420569E-07,"contempt":0.001118677,"disgust":1.47923924E-06,"fear":3.15374564E-06,"happiness":0.06511541,"neutral":0.932194948,"sadness":0.00139758235,"surprise":0.000168059792}}]';
        var emotion = Oxford.extractMainEmotion(response, 1);
        var finalemotion = emotion.emotion;
        expect (finalemotion).toEqual("neutral");
    });

});