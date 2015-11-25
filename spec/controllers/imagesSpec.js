console.log = function() {}; //Disable logs

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
    var ImageCtrl = require('../../controllers/images');
    
    it("Should fail with an empty document", function(done) {
        ImageCtrl.checkDocument(undefined, function(error, newImage) {
            expect(error).toBeTruthy();
            done();
        });
    });
    
    it("Should fail with sth that is not a document", function(done) {
        ImageCtrl.checkDocument("Wolololo", function(error, newImage) {
            expect(error).toBeTruthy();  
            done();
        });
    });
    
    it("Should fail be OK with a complete document", function(done) {
        
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
           done();
        });
    });
    
    it("Should fail be Oxford returns error", function(done) {
        
        var document = new ImageCtrl.imageDB({
            username:    "test",
            ip:          "127.0.0.1",
            date:        new Date(),
            image:       "IMAGE"
        });
        
        var oldOxfordLibrary = ImageCtrl.oxfordLib.recognizeImageB64.bind({});
        
        ImageCtrl.oxfordLib.recognizeImageB64 = function(imageB64, callback) {
            callback("Simulated error", ImageCtrl.oxfordLib.emptyResponse);
        };
        ImageCtrl.checkDocument(document, function(error, newImage) {   
           expect(error).toBeTruthy();
           ImageCtrl.oxfordLib.recognizeImageB64 = oldOxfordLibrary.bind({});
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
        var oldOxfordLibrary = ImageCtrl.oxfordLib.recognizeImageB64.bind({});
        ImageCtrl.oxfordLib.recognizeImageB64 = function(imageB64, callback) {
            callback(false, ImageCtrl.oxfordLib.emptyResponse);
        };
        
        //Capture the call to the DB
        var called = false;
        var oldFindOne = ImageCtrl.imageDB.findOneAndRemove.bind({});
        ImageCtrl.imageDB.findOneAndRemove = function (id, options, callback) {
            called = true;
            callback (false, id);
        };
        
        ImageCtrl.checkDocument(document, function(error, newImage) {   
           expect(error).toBeFalsy();
           expect(newImage).toBeFalsy();
           expect(called).toBeTruthy();
           ImageCtrl.oxfordLib.recognizeImageB64 = oldOxfordLibrary.bind({});
           ImageCtrl.imageDB.findOneAndRemove = oldFindOne.bind({});
           done();
        });      
    });
    
    it("Should return error and the old document if the DB is down upong deleting a document", function(done) {
        
        var document = new ImageCtrl.imageDB({
            username:    "test",
            ip:          "127.0.0.1",
            date:        new Date(),
            image:       "IMAGE"
        });
        //Ofxord returns that no emotion has been found
        var oldOxfordLibrary = ImageCtrl.oxfordLib.recognizeImageB64.bind({});
        ImageCtrl.oxfordLib.recognizeImageB64 = function(imageB64, callback) {
            callback(false, ImageCtrl.oxfordLib.emptyResponse);
        };
        
        //Capture the call to the DB
        var oldFineOne = ImageCtrl.imageDB.findOneAndRemove.bind({});
        ImageCtrl.imageDB.findOneAndRemove = function (id, options, callback) {
            callback ("Down trolololo", document);
        };
        
        ImageCtrl.checkDocument(document, function(error, newImage) {   
           expect(error).toBeTruthy();
           expect(newImage).toBe(document);
           ImageCtrl.oxfordLib.recognizeImageB64 = oldOxfordLibrary.bind({});
           ImageCtrl.imageDB.findOneAndRemove = oldFineOne.bind({});
           done();
        });      
    });
    
        it("Should return error and he old document should be returned", function(done) {
        
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
        var oldOxfordRecognize = ImageCtrl.oxfordLib.recognizeImageB64.bind({});
        ImageCtrl.oxfordLib.recognizeImageB64 = function(imageB64, callback) {
            callback(false, "newemotions");
        };
        
        var oldOxfordExtract = ImageCtrl.oxfordLib.extractMainEmotion.bind({});
        ImageCtrl.oxfordLib.extractMainEmotion = function(emotions) {
            return ("newmainemotion");
        };
        
        //Capture the calls to the DB
        var oldFindOne = ImageCtrl.imageDB.findOneAndUpdate.bind({});
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
           ImageCtrl.oxfordLib.recognizeImageB64 = oldOxfordRecognize.bind({});
           ImageCtrl.oxfordLib.extractMainEmotion = oldOxfordExtract.bind({});
           ImageCtrl.imageDB.findOneAndUpdate = oldFindOne.bind({});          
           done();
        });      
    });
    
        
    it("Should return error and he old document if the DB fails upon updating", function(done) {
        
        var document = new ImageCtrl.imageDB({
            username:    "test",
            ip:          "127.0.0.1",
            date:        new Date(),
            image:       "IMAGE"
        });
        
        //Capture calls to oxford
        var oldOxfordRecognize = ImageCtrl.oxfordLib.recognizeImageB64.bind({});
        ImageCtrl.oxfordLib.recognizeImageB64 = function(imageB64, callback) {
            callback(false, "newemotions");
        };
        
        var oldOxfordExtract = ImageCtrl.oxfordLib.extractMainEmotion.bind({});
        ImageCtrl.oxfordLib.extractMainEmotion = function(emotions) {
            return ("newmainemotion");
        };
        
        //Capture the calls to the DB
        var oldFindOne = ImageCtrl.imageDB.findOneAndUpdate.bind({});
        ImageCtrl.imageDB.findOneAndUpdate = function (conditions, update, options, callback) {
            callback("Down TROLL", undefined);
        };
        
        ImageCtrl.checkDocument(document, function(error, newImage) {   
           expect(error).toBeTruthy();
           expect(newImage).toBe(document);
           ImageCtrl.oxfordLib.recognizeImageB64 = oldOxfordRecognize.bind({});
           ImageCtrl.oxfordLib.extractMainEmotion = oldOxfordExtract.bind({});
           ImageCtrl.imageDB.findOneAndUpdate = oldFindOne.bind({});
           done();
        });      
    });
    
});

describe("Controllers: images - updateImagesWithoutEmotions", function() {
    var ImageCtrl = require('../../controllers/images');
    var DocumentBasic;
    var DocumentBasicEmotions;
    var DocumentBasicMainEmotion;
    var DocumentFull;
    
    beforeEach(function(done){        
        DocumentBasic = new ImageCtrl.imageDB({
            username:    "test",
            ip:          "127.0.0.1",
            date:        new Date(),
            image:       "IMAGE"
        });
        
        DocumentFull = new ImageCtrl.imageDB({
            username:    "test",
            ip:          "127.0.0.1",
            date:        new Date(),
            image:       "IMAGE",
            emotions:    "emotions",
            mainemotion: "mainemotion"
        });
        
        DocumentBasicEmotions = new ImageCtrl.imageDB({
            username:    "test",
            ip:          "127.0.0.1",
            date:        new Date(),
            image:       "IMAGE",
            mainemotion: "mainemotion"
        });
        
        DocumentBasicMainEmotion = new ImageCtrl.imageDB({
            username:    "test",
            ip:          "127.0.0.1",
            date:        new Date(),
            image:       "IMAGE",
            mainemotion: "mainemotion"
        });
        
        done();
        
    });
    
    it("Return error if the DB fails", function(done) {
        var oldFind = ImageCtrl.imageDB.find.bind({});
        ImageCtrl.imageDB.find = function (conditions, fields, options, callback) {
            callback ("Error", undefined);
        };
        
        ImageCtrl.updateImagesWithoutEmotions(0, function (error, documents) {
            expect(error).toBeTruthy();
            ImageCtrl.imageDB.find = oldFind.bind({});
            done();
        });
    });
    
    it("Calls checkDocument for every document returned", function(done) {
        var oldFind = ImageCtrl.imageDB.find.bind({});
        ImageCtrl.imageDB.find = function (conditions, fields, options, callback) {
            console.log("my find");
            callback (false, [DocumentBasic, DocumentBasic, DocumentBasic]);
        };
        
        var calls = 0;
        var oldCheck = ImageCtrl.checkDocument.bind({});
        ImageCtrl.checkDocument = function (document, callback) {
            console.log("my document");
            calls = calls +1;
            callback(false, document);
        };
        
        ImageCtrl.updateImagesWithoutEmotions(0, function (error, documents) {
            expect(calls).toBe(3);
            ImageCtrl.imageDB.find = oldFind.bind({});
            ImageCtrl.checkDocument = oldCheck.bind({});
            done();
            
        });
    });
    
});