describe("Controllers: images - checkRequest", function() {
    
    var httpMocks = require('node-mocks-http');
    var ImageCtrl = require('../../controllers/images');
    
    var myRequest;
    
    beforeEach(function(){
        myRequest = httpMocks.createRequest({
            method: 'POST',
            url: '/api/images'
        });
        var body = { "image": "aaaaa", "username": "prueba", "date":"lun. nov. 23 13:10:23 2015"};
        myRequest._setBody (body);
        myRequest.headers['content-type'] = 'application/json';
    });
    
    it("Empty request should fail", function() {
        var ok = ImageCtrl._checkRequest(undefined);
        expect(ok).toBeFalsy();
    });
    
    it("Valid request should pass", function() {
        var ok = ImageCtrl._checkRequest(myRequest);
        expect(ok).toBeTruthy();
    });
    
    it("Request without body should fail", function() {
        myRequest._setBody({});
        var ok = ImageCtrl._checkRequest(myRequest);
        expect(ok).toBeFalsy();
    });
    
    it("Request with a different method than POST should fail", function() {
        myRequest = httpMocks.createRequest({
            method: 'GET',
            url: '/api/images'
        });
        var body = { "image": "aaaaa", "username": "prueba", "date":"lun. nov. 23 13:10:23 2015"};
        myRequest._setBody (body);
        myRequest.headers['content-type'] = 'application/json';
        var ok = ImageCtrl._checkRequest(myRequest);
        expect(ok).toBeFalsy();
    });
    
    it("Request with a different content-type should fail", function() {
        myRequest.headers['content-type'] = 'application/txt';
        var ok = ImageCtrl._checkRequest(myRequest);
        expect(ok).toBeFalsy();
    });
    
    it("Request without username", function() {
        var body = { "image": "aaaaa", "date":"lun. nov. 23 13:10:23 2015"};
        myRequest._setBody (body);
        
        var ok = ImageCtrl._checkRequest(myRequest);
        expect(ok).toBeFalsy();
    });
    
    it("Request without image", function() {
        var body = { "username": "prueba", "date":"lun. nov. 23 13:10:23 2015"};
        myRequest._setBody (body);
        
        var ok = ImageCtrl._checkRequest(myRequest);
        expect(ok).toBeFalsy();
    });  
    
});

describe("Controllers: images - checkDocument", function() {
    var ImageCtrl;
    console.log = function() {}; //Disable logs
    
    beforeEach(function(){
        ImageCtrl = require('../../controllers/images');
    });
    
    it("Should fail with an empty document", function() {
        ImageCtrl.checkDocument(undefined, function(error, newImage) {
            expect(error).toBeTruthy();           
        });
    });
    
    it("Should fail with sth that is not a document", function() {
        ImageCtrl.checkDocument("Wolololo", function(error, newImage) {
            expect(error).toBeTruthy();           
        });
    });
    
    it("Should fail be OK with a complete document", function() {
        
        var document = new ImageCtrl.imageDB({
            username:    "test",
            ip:          "127.0.0.1",
            date:        new Date(),
            image:       "IMAGE",
            emotions:    "EMOTIONS",
            mainemotion: "MAINEMOTION"
        });
        
        ImageCtrl.checkDocument(document, function(error, newImage) {   
           expect(error).toBeFalsy();           
        });
    });
    
    it("Should fail be Oxford returns error", function(done) {
        
        var document = new ImageCtrl.imageDB({
            username:    "test",
            ip:          "127.0.0.1",
            date:        new Date(),
            image:       "IMAGE"
        });
        ImageCtrl.oxfordLib.recognizeImageB64 = function(imageB64, callback) {
            callback("Simulated error", ImageCtrl.oxfordLib.emptyResponse);
        };
        ImageCtrl.checkDocument(document, function(error, newImage) {   
           expect(error).toBeTruthy();
           done();
        });
    });
    
    it("Should call delete Document when no emotions are found", function(done) {
        
        var document = new ImageCtrl.imageDB({
            username:    "test",
            ip:          "127.0.0.1",
            date:        new Date(),
            image:       "IMAGE"
        });
        //Ofxord returns that no emotion has been found
        ImageCtrl.oxfordLib.recognizeImageB64 = function(imageB64, callback) {
            callback(false, ImageCtrl.oxfordLib.emptyResponse);
        };
        
        //Capture the call to the DB
        var called = false;
        ImageCtrl.imageDB.findOneAndRemove = function (id, options, callback) {
            called = true;
            callback (false, id);
        };
        
        ImageCtrl.checkDocument(document, function(error, newImage) {   
           expect(error).toBeFalsy();
           expect(newImage).toBeFalsy();
           expect(called).toBeTruthy();
           done();
        });      
    });
    
        
    it("Should call update Document when new emotions are received and return the new image", function(done) {
        
        var document = new ImageCtrl.imageDB({
            username:    "test",
            ip:          "127.0.0.1",
            date:        new Date(),
            image:       "IMAGE"
        });
        
        var updatedDocument = new ImageCtrl.imageDB({
            username:    "test",
            ip:          "127.0.0.1",
            date:        new Date(),
            image:       "IMAGE",
            emotions:    "oldemotions",
            mainemotion: "oldmainemotion"
        });
        
        //Capture calls to oxford
        ImageCtrl.oxfordLib.recognizeImageB64 = function(imageB64, callback) {
            callback(false, "newemotions");
        };
        
        ImageCtrl.oxfordLib.extractMainEmotion = function(emotions) {
            return ("newmainemotion");
        };
        
        //Capture the calls to the DB
        ImageCtrl.imageDB.findOneAndUpdate = function (conditions, update, options, callback) {
            console.log("My findOneAndUpdate: ");
            //Should probably parse the update argument.
            updatedDocument.emotions = "newemotions";
            updatedDocument.mainemotion = "newmainemotion";
            callback (false, updatedDocument);
        };
        
        ImageCtrl.checkDocument(document, function(error, newImage) {   
           expect(error).toBeFalsy();
           expect(newImage.emotions).toBe("newemotions");
           expect(newImage.mainemotion).toBe("newmainemotion");
           done();
        });      
    });
    
});
