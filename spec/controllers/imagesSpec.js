//console.log = function() {}; //Disable logs

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
    
    it("Should be OK with a complete document", function(done) {
        
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

describe("Controllers: images - _checkQueryLimit", function() {
    var ImageCtrl = require('../../controllers/images');

    it("False with undefined", function(){
        expect(ImageCtrl._checkQueryLimit(undefined)).toBeFalsy();
    });
    
    it("False with null", function(){
        expect(ImageCtrl._checkQueryLimit(null)).toBeFalsy();
    });
    
    it("False with double", function(){
        expect(ImageCtrl._checkQueryLimit(2.2)).toBeFalsy();
    });
    
    it("False with string", function(){
        expect(ImageCtrl._checkQueryLimit("2")).toBeFalsy();
    });
    
    it("False with negative", function(){
        expect(ImageCtrl._checkQueryLimit(-4)).toBeFalsy();
    });
    
    it("True with 0", function(){
        expect(ImageCtrl._checkQueryLimit(0)).toBeTruthy();
    });
    
    it("True with positive int", function(){
        expect(ImageCtrl._checkQueryLimit(10)).toBeTruthy();
    });
    
});

describe("Controllers: images - _checkOnlyWithEmotions", function() {
    var ImageCtrl = require('../../controllers/images');

    it("True with 'true'", function(){
        expect(ImageCtrl._checkOnlyWithEmotions(true)).toBeTruthy();
    });
    
    it("True with 'false'", function(){
        expect(ImageCtrl._checkOnlyWithEmotions(false)).toBeTruthy();
    });
    
    it("False with 'undefined'", function(){
        expect(ImageCtrl._checkOnlyWithEmotions(undefined)).toBeFalsy;
    });
    
    it("False with String", function(){
        expect(ImageCtrl._checkOnlyWithEmotions("true")).toBeFalsy;
    });
    
    it("False with Int", function(){
        expect(ImageCtrl._checkOnlyWithEmotions(0)).toBeFalsy;
    });
    
    it("False with Int 1", function(){
        expect(ImageCtrl._checkOnlyWithEmotions(1)).toBeFalsy;
    });
    
});

describe("Controllers: images - _checkSortbyDate", function() {
    var ImageCtrl = require('../../controllers/images');

    it("True with 'asc'", function(){
        expect(ImageCtrl._checkSortbyDate('asc')).toBeTruthy();
    });
    
    it("True with 'desc'", function(){
        expect(ImageCtrl._checkSortbyDate('asc')).toBeTruthy();
    });
    
    it("True with 'false'", function(){
        expect(ImageCtrl._checkSortbyDate(false)).toBeTruthy();
    });
    
    it("False with 'undefined'", function(){
        expect(ImageCtrl._checkSortbyDate(undefined)).toBeFalsy;
    });
    
    it("False with other string", function(){
        expect(ImageCtrl._checkSortbyDate("true")).toBeFalsy;
    });
    
    it("False with Int", function(){
        expect(ImageCtrl._checkSortbyDate(0)).toBeFalsy;
    });
});

describe("Controllers: images - _checkReturnImage", function() {
    var ImageCtrl = require('../../controllers/images');

    it("True with 'true'", function(){
        expect(ImageCtrl._checkReturnImage(true)).toBeTruthy();
    });
    
    it("True with 'false'", function(){
        expect(ImageCtrl._checkReturnImage(false)).toBeTruthy();
    });
    
    it("False with 'undefined'", function(){
        expect(ImageCtrl._checkReturnImage(undefined)).toBeFalsy;
    });
    
    it("False with String", function(){
        expect(ImageCtrl._checkReturnImage("true")).toBeFalsy;
    });
    
    it("False with Int", function(){
        expect(ImageCtrl._checkReturnImage(0)).toBeFalsy;
    });
    
    it("False with Int 1", function(){
        expect(ImageCtrl._checkReturnImage(1)).toBeFalsy;
    });
    
});

describe("Controllers: images - _checkUsername", function() {
    var ImageCtrl = require('../../controllers/images');

    it("True with 'String'", function(){
        expect(ImageCtrl._checkUsername("User")).toBeTruthy();
    });
    
    it("True with 'false'", function(){
        expect(ImageCtrl._checkUsername(false)).toBeTruthy();
    });
    
    it("False with emptyString", function(){
        expect(ImageCtrl._checkUsername("")).toBeFalsy;
    });
    
    it("False with undefined", function(){
        expect(ImageCtrl._checkUsername(undefined)).toBeFalsy;
    });
    
    it("False with Int", function(){
        expect(ImageCtrl._checkUsername(0)).toBeFalsy;
    });
    
    it("False with true", function(){
        expect(ImageCtrl._checkUsername(true)).toBeFalsy;
    });
    
});

describe("Controllers: images - _checkOptions", function() {
    var ImageCtrl = require('../../controllers/images');
    
    it ("Error with undefined", function (done) {
        ImageCtrl._checkOptions(undefined, function (error, optionJson) {
            expect(error).toBeTruthy();
            done();
        });
    });
    
    it ("Error with int", function (done) {
        ImageCtrl._checkOptions(2, function (error, optionJson) {
            expect(error).toBeTruthy();
            done();
        });
    });
    
    it ("Error with an invalid String", function (done) {
        ImageCtrl._checkOptions("aaaaaaa", function (error, optionJson) {
            expect(error).toBeTruthy();
            done();
        });
    });
    
    it ("OK with empty options", function (done) {
        ImageCtrl._checkOptions({}, function (error, optionJson) {
            expect(error).toBeFalsy();
            expect(optionJson.queryLimit).toEqual(0);
            expect(optionJson.onlyWithEmotions).toEqual(true);
            expect(optionJson.sortbyDate).toEqual(false);
            expect(optionJson.returnImage).toEqual(false);
            expect(optionJson.username).toEqual(false);
            done();
        });
    });
    
    it ("OK with valid queryLimit", function (done) {
        ImageCtrl._checkOptions({queryLimit : 10}, function (error, optionJson) {
            expect(error).toBeFalsy();
            expect(optionJson.queryLimit).toEqual(10);
            done();
        });
    });

    it ("Error with invalid queryLimit", function (done) {
        ImageCtrl._checkOptions({queryLimit : "aaaa"}, function (error, optionJson) {
            expect(error).toBeTruthy();
            done();
        });
    });
    
    it ("OK with valid onlyWithEmotions", function (done) {
        ImageCtrl._checkOptions({onlyWithEmotions : false}, function (error, optionJson) {
            expect(error).toBeFalsy();
            expect(optionJson.onlyWithEmotions).toEqual(false);
            done();
        });
    });
    
    it ("Error with invalid queryLimit", function (done) {
        ImageCtrl._checkOptions({onlyWithEmotions : "aaaa"}, function (error, optionJson) {
            expect(error).toBeTruthy();
            done();
        });
    });
    
    it ("OK with valid sortbyDate", function (done) {
        ImageCtrl._checkOptions({sortbyDate : 'asc'}, function (error, optionJson) {
            expect(error).toBeFalsy();
            expect(optionJson.sortbyDate).toEqual('asc');
            done();
        });
    });

    it ("Error with invalid sortbyDate", function (done) {
        ImageCtrl._checkOptions({sortbyDate : "tyotorltok"}, function (error, optionJson) {
            expect(error).toBeTruthy();
            done();
        });
    });
    
    it ("OK with valid returnImage", function (done) {
        ImageCtrl._checkOptions({returnImage : true}, function (error, optionJson) {
            expect(error).toBeFalsy();
            expect(optionJson.returnImage).toEqual(true);
            done();
        });
    });
    
    it ("Error with invalid returnImage", function (done) {
        ImageCtrl._checkOptions({returnImage : "tyotorltok"}, function (error, optionJson) {
            expect(error).toBeTruthy();
            done();
        });
    });
    
    it ("OK with valid username", function (done) {
        ImageCtrl._checkOptions({username : "My username"}, function (error, optionJson) {
            expect(error).toBeFalsy();
            expect(optionJson.username).toEqual("My username");
            done();
        });
    });
    
    it ("Error with invalid username", function (done) {
        ImageCtrl._checkOptions({username : 98484684}, function (error, optionJson) {
            expect(error).toBeTruthy();
            done();
        });
    });
    
    it ("Check default parameter in a half completed options", function (done) {
        ImageCtrl._checkOptions({username : "My username", queryLimit: 30}, function (error, optionJson) {
            expect(error).toBeFalsy();
            expect(optionJson.queryLimit).toEqual(30);
            expect(optionJson.onlyWithEmotions).toEqual(true);
            expect(optionJson.sortbyDate).toEqual(false);
            expect(optionJson.returnImage).toEqual(false);
            expect(optionJson.username).toEqual("My username");
            done();
        });
    });
    
    it ("Check with invalid parameter in a half completed options", function (done) {
        ImageCtrl._checkOptions({username : "My username", queryLimit: 30, random: "Invalid"}, function (error, optionJson) {
            expect(error).toBeTruthy();
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
    
    it("Validates with _checkQueryLimit", function(done){
        var myLimit = ImageCtrl._checkQueryLimit.bind(ImageCtrl);
        var called = false;
        ImageCtrl._checkQueryLimit = function (queryLimit) {
            called = true;
            return false;
        };
        
        ImageCtrl.updateImagesWithoutEmotions(undefined, function (error, documents) {
            expect(called).toBeTruthy();
            expect(error).toBeTruthy();
            ImageCtrl._checkQueryLimit = myLimit.bind(ImageCtrl);
            done();
        });
    });
    
    it("Return error if the DB fails", function(done) {
        var oldFind = ImageCtrl.imageDB.find.bind(ImageCtrl);
        ImageCtrl.imageDB.find = function (conditions, fields, options, callback) {
            callback ("Error", undefined);
        };
        
        ImageCtrl.updateImagesWithoutEmotions(0, function (error, documents) {
            expect(error).toBeTruthy();
            ImageCtrl.imageDB.find = oldFind.bind(ImageCtrl);
            done();
        });
    });
    
    it("Calls checkDocument for every document returned", function(done) {
        var oldFind = ImageCtrl.imageDB.find.bind({});
        ImageCtrl.imageDB.find = function (conditions, fields, options, callback) {
            callback (false, [DocumentBasic, DocumentBasic, DocumentBasic]);
        };
        
        var calls = 0;
        var oldCheck = ImageCtrl.checkDocument.bind({});
        ImageCtrl.checkDocument = function (document, callback) {
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
    
    it("Returns modified documents by checkdocument", function(done) {
        var oldFind = ImageCtrl.imageDB.find.bind({});
        ImageCtrl.imageDB.find = function (conditions, fields, options, callback) {
            callback (false, [DocumentBasic, DocumentBasic, DocumentBasic]);
        };
        
        var oldCheck = ImageCtrl.checkDocument.bind({});
        ImageCtrl.checkDocument = function (document, callback) {
            callback(false, DocumentFull);
        };
        
        ImageCtrl.updateImagesWithoutEmotions(0, function (error, documents) {
            expect(documents).toEqual([DocumentFull, DocumentFull, DocumentFull]);
            ImageCtrl.imageDB.find = oldFind.bind({});
            ImageCtrl.checkDocument = oldCheck.bind({});
            done();
            
        });
    });
    
    it("Returns when deleted documents by checkdocument", function(done) {
        var oldFind = ImageCtrl.imageDB.find.bind({});
        ImageCtrl.imageDB.find = function (conditions, fields, options, callback) {
            callback (false, [DocumentBasic, DocumentBasic, DocumentBasic]);
        };
        
        var oldCheck = ImageCtrl.checkDocument.bind({});
        ImageCtrl.checkDocument = function (document, callback) {
            callback(false, undefined);
        };
        
        ImageCtrl.updateImagesWithoutEmotions(0, function (error, documents) {
            expect(documents).toEqual([undefined, undefined, undefined]);
            ImageCtrl.imageDB.find = oldFind.bind({});
            ImageCtrl.checkDocument = oldCheck.bind({});
            done();
            
        });
    });
});

describe("Controllers: images - getImagesStoredWithEmotions", function() {
    var ImageCtrl = require('../../controllers/images');
    
    var DocumentFull = new ImageCtrl.imageDB({
        username:    "test",
        ip:          "127.0.0.1",
        date:        new Date(),
        image:       "IMAGE",
        emotions:    "emotions",
        mainemotion: "mainemotion"
    });
    
    xit("Validates with _checkOptions", function(done){
        expect(true).toBeFalsy();
    });
    
    it("Return error if the DB fails", function(done) {
        var oldFind = ImageCtrl.imageDB.find.bind(ImageCtrl);
        ImageCtrl.imageDB.find = function (conditions, fields, options, callback) {
            callback ("Error", undefined);
        };
        
        ImageCtrl.getImagesStoredWithEmotions(0, function (error, documents) {
            expect(error).toBeTruthy();
            ImageCtrl.imageDB.find = oldFind.bind(ImageCtrl);
            done();
        });
    });
    
    it("Returns the documents returned by the DB", function(done) {
        var oldFind = ImageCtrl.imageDB.find.bind(ImageCtrl);
        ImageCtrl.imageDB.find = function (conditions, fields, options, callback) {
            callback (false, [DocumentFull, DocumentFull, DocumentFull]);
        };
        
        ImageCtrl.getImagesStoredWithEmotions(0, function (error, documents) {
            expect(error).toBeFalsy();
            expect(documents).toEqual([DocumentFull, DocumentFull, DocumentFull]);
            ImageCtrl.imageDB.find = oldFind.bind(ImageCtrl);
            done();
        });
    });
    
    
});