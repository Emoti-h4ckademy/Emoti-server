describe("Controllers: images - checkRequest", function() {
    
    var httpMocks = require('node-mocks-http');
    var ImageCtrl = require('../../controllers/images');
    
    var myRequest;
    
    beforeEach(function(){
        myRequest = httpMocks.createRequest({
            method: 'POST',
            url: '/api/images'
        });
        var body = { "image": "aaaaa", "username": "prueba", "date":"lun. nov. 23 13:10:23 2015"}
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
        var body = { "image": "aaaaa", "username": "prueba", "date":"lun. nov. 23 13:10:23 2015"}
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
        var body = { "image": "aaaaa", "date":"lun. nov. 23 13:10:23 2015"}
        myRequest._setBody (body);
        
        var ok = ImageCtrl._checkRequest(myRequest);
        expect(ok).toBeFalsy();
    });
    
    it("Request without image", function() {
        var body = { "username": "prueba", "date":"lun. nov. 23 13:10:23 2015"}
        myRequest._setBody (body);
        
        var ok = ImageCtrl._checkRequest(myRequest);
        expect(ok).toBeFalsy();
    });  
    
});


