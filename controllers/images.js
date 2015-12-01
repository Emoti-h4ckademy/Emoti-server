/**
 * Images constructor
 * 
 * The exports object of the "images" module is an instance of this class.
 * Most apps will only use this one instance.
 */
function Images () {
    this.imageDB = require('../models/image');
    this.oxfordLib = require('../lib/oxford');
    
    this._optionsDefault = {
        queryLimit :          0,
        onlyWithEmotions :    true,
        sortByDate :          false,
        returnImage :         false,
        username :            false
    };
    
    this._optionsFunctions = {
        queryLimit :          this._checkQueryLimit,
        onlyWithEmotions :    this._checkOnlyWithEmotions,
        sortByDate :          this._checkSortbyDate,
        returnImage :         this._checkReturnImage,
        username :            this._checkUsername
    };
}

/**
 * Checks whether a document has all the emotion arguments stored and,
 * if not, tries to retrieve them
 * If the system cannot analyze the image it will do nothing
 * If there aren't any faces/emotions in the image the document will be drop from the DB
 * It there are emotions, the document will be updated in the DB
 * @param {type} document As retrieved from the DB
 * @param {type} callback - Function to callback (error, Image)
 *      Error: If there has been a problem during processing the image or storing in the DB
 *      Image: The old image if it doesn't get modified or the new one if it does
 * @returns {undefined}
 */
Images.prototype.checkDocument = function (document, callback) {
    var self = this;
    
    if (!document || !document._doc) {
        callback ("Invalid document", undefined); 
        return;
    }
    
    var extractedImage = document._doc;
    if (extractedImage.mainemotion && extractedImage.emotions) {
        callback (false, document);
        return;
    }
    
    self.oxfordLib.recognizeImageB64(extractedImage.image, function(error, emotions){
        if (error) {
            console.log ("checkDocument: ERROR WITH OXFORD: " + error);
            callback (true, extractedImage);
            return;
        }

        if(emotions === self.oxfordLib.emptyResponse){
            self.imageDB.findOneAndRemove(
                {'_id': extractedImage._id},
                {},
                function (error, result) {
                    if (error) {
                        console.log("checkDocument: Failed to delete in the db: " + error);
                        callback(error, document);
                        return;
                    } else {
                        console.log("checkDocument: No emotion detected - ID ("+ extractedImage._id +") deleted from db.");
                        callback (error, undefined);
                        return;
                    }
                }
            );
        }
        
        //Update the image in the DB with emotions
        var mainEmotionObj = self.oxfordLib.extractMainEmotion(emotions);
        var mainEmotion = mainEmotionObj.emotion;
        self.imageDB.findOneAndUpdate(
            {'_id': extractedImage._id}, 
            { $set: { emotions: emotions, mainemotion: mainEmotion}},
            {new: true},
            function (error, result) {
                if (error) {
                    console.log("checkDocument: Failed to update document in the db: " + error);
                    callback(error, document);
                } else {
                    console.log("checkDocument: Emotion detected " + mainEmotion + "- ID ("+ extractedImage._id + "). Updated in the DB");
                    callback (false, result);
                    return;
                }

            }
        );
        
    });
};

/**
 * Checks whether the parameter is valid for a query limit, that is, is an positive int
 * @param {type} queryLimit
 * @returns {Boolean} true if its valid, false if it isn't
 */
Images.prototype._checkQueryLimit = function (queryLimit) {
    return (queryLimit === parseInt(queryLimit) && queryLimit >= 0);
};

/**
 * Checks whether the parameter is a valid onlyWithEmotions options value
 * @param {type} onlyWithEmotions
 * @returns {Boolean} true if its valid, false if it isn't
 */
Images.prototype._checkOnlyWithEmotions = function (onlyWithEmotions) {
    return (typeof(onlyWithEmotions) === "boolean");
};

/**
 * Checks whether the parameter is valid for a sortByDate options value
 * @param {type} sortByDate
 * @returns {Boolean}
 */
Images.prototype._checkSortbyDate = function (sortByDate) {
    return (sortByDate === 'asc' || sortByDate === 'desc' || sortByDate === false);
};

/**
 * Checks whether the parameter is valid for a returnImage options value
 * @param {type} returnImage
 * @returns {Boolean}
 */
Images.prototype._checkReturnImage = function (returnImage) {
    return (typeof(returnImage) === "boolean");
};

/**
 * Checks whether the parameter is valid for a checkUsername options value
 * @param {type} username
 * @returns {Boolean}
 */
Images.prototype._checkUsername = function (username){
    return (username === false || typeof(username) === "string");
};

/**
 * Checks the options parameter for a Images query
 * @param {type} myOptions Options for the query. If an option is setup more than once,
 * it will take the last value
 * @param {type} callback (error, optionsSet)
 * Error will only be false if all the options are parsed correctly
 * OptionSet is an object with all the options configured, either to the passed value or to default
 * @returns {undefined}
 */
Images.prototype._checkOptions = function (myOptions, callback) {
    var self = this;
    var returnOptions = Object.create(self._optionsDefault);
    
    if (typeof(myOptions) !== "object") {
        callback ("Invalid option object", returnOptions);
        return;
    }

    for (var key in myOptions) {
        if (!self._optionsFunctions[key]) {
            callback ("Invalid key: " + key, returnOptions);
            return;
        }
        
        if (!self._optionsFunctions[key](myOptions[key])) {
            callback ("Invalid value (" + myOptions[key] +") for option " + key);
            return;
        }
        
        returnOptions[key] = myOptions[key];
    }
    
    callback (false, returnOptions);
};

/**
 * Checks the DB for images without emotions stored and updates them
 * Refer to checkDocument to know the final state of the documents.
 * If a document is deleted returns undefined in its position
 * @param {type} queryLimit - Maximum number of images to analyze (0 for All).
 * Consider the maximum calls for minute allowed by Oxford (currentyly 20)
 * @param {type} callback (error, updatedDocuments)
 * @returns {undefined}
 */
Images.prototype.updateImagesWithoutEmotions = function (queryLimit, callback) {
    var self = this;
    if (!self._checkQueryLimit(queryLimit))
    {
        callback("Invalid queryLimit size", undefined);
        return;
    }
    
    self.imageDB.find(
        {$or: [ {"mainemotion" : { "$exists" : false }},
                {"emotions" : { "$exists" : false }}
              ]},
        {},
        { limit : queryLimit },
        function (error, documents) {
            if (!error) {
                for (var iterator = 0; iterator < documents.length; iterator++) {
                    self.checkDocument(documents[iterator], function (error, image) {
                        if (!error) documents[iterator] = image;
                    });
                }
            }

            callback (error, documents);
        }
    );
};

/**
 * Generate the parameter for the DB function find
 * @param {type} options - Options Object (structure should be as _optionsDefault).
 * Validated with _checkOptions
 * @param {type} callback (error, conditions, fields, options)
 * @returns {undefined}
 */
Images.prototype._generateMongoDBParameters = function (options, callback) {
    var self = this;
    
    self._checkOptions(options, function(error, optionsSet) {
        if (error) {
            callback (error, undefined, undefined, undefined);
            return;
        }
        
        var conditionsV = [];
        var fields = 'username ip date emotions mainemotion';
        var options = { limit : optionsSet.queryLimit};
        if (optionsSet.sortByDate) {
            options.sort = [['date', optionsSet.sortByDate]];
        }
        
        if (optionsSet.onlyWithEmotions) {
            conditionsV.push ({"mainemotion" : { "$exists" : true }});
            conditionsV.push ({"emotions" : { "$exists" : true }});
        }
        
        if (optionsSet.username) {
            conditionsV.push ({"username" : optionsSet.username});
        }
        
        if (optionsSet.returnImage) {
            fields += ' image';
        }
        
        var conditions = (conditionsV.length ? {$and : conditionsV} : {});
        callback (false, conditions, fields, options);
    });   
};

/**
 * Gets documents from the DB
 * @param {type} options - Options for the query. Must have the same structure as _optionsDefault.
 * Parses with _generateMongoDBParameters
 * @param {type} callback (error, documents)
 * @returns {undefined}
 */
Images.prototype.getImages = function (options, callback) {
    var self = this;
    
    self._generateMongoDBParameters(options, function(error, conditions, fields, options) {
        if (error) {
            callback (error, []);
            return;
        }

        self.imageDB.find(conditions, fields, options, function (error, images) {
                callback(error, images);
                return;
            }
        );
    });
};


/**
 * Retrieves images with emotions from the DB
 * @param {type} queryLimit - Maximum number of images to analyze (0 for All)
 * @param {type} callback (error, Documents)
 * @returns {undefined}
 */
Images.prototype.getImagesStoredWithEmotions = function(queryLimit, callback) {
    var self = this;
    if (!self._checkQueryLimit(queryLimit))
    {
        callback("Invalid queryLimit size", undefined);
        return;
    }
    
    self.imageDB.find(
        {$and: [ {"mainemotion" : { "$exists" : true }},
                {"emotions" : { "$exists" : true }}
              ]},
        {},
        { limit : queryLimit },
        function (err, images) {
            callback(err, images);
        }
    );
};

/**
 * 
 * @param {type} queryLimit
 * @param {type} username
 * @param {type} callback
 * @returns {undefined}
 */
Images.prototype.getImagesbyUsername = function(queryLimit, username, callback) {
    var self = this;
    self.imageDB.find(
        {'username' : username},
        {},
        { sort: [['date', 'desc']], limit : queryLimit},
        function (err, images) {
            callback(err, images);
        }
    );
};

////// ADD OPTION START DATE ?????
Images.prototype.getImagesbyDates = function (month, callback) {
    var self = this;
    self.imageDB.find(
        {$and: [ {"mainemotion" : { "$exists" : true }},
                {"emotions" : { "$exists" : true }},
                {'date' : {'$gte': new Date(2015, month, 1), '$lt': new Date(2015, month + 1, 3)}}
              ]},
        'username mainemotion emotions date',
        {$sort: { 'date' : 'ascending' } },
        function (err, images) {
            console.log("Number of images: " + images); // Space Ghost is a talk show host.
            callback(err, images);
        }
    );
};


/**
 * Checks whether a request to the addImage function is valid
 * @param {type} request HTTP request
 * @returns {Boolean}
 */
Images.prototype._checkRequest = function (request)
{
    if ((!request) ||
        (request.method !== 'POST') ||
        (request.get('Content-Type') !== 'application/json')) {
        return false;
    }
    
    var existsUsername = request.body.username;
    var existsImage = request.body.image;
    if (!existsImage || !existsUsername) {
        return false;
    }
    
    return true;
};

/**
 * Receives a HTTP Request with an image and stores it in the DB.
 * If oxfordLib is down then the image is stored without info of the emotion
 * @param {type} req - HTTP request with the image
 * @param {type} res - HTTP Response to use
 * @returns {undefined}
 */
Images.prototype.addImage = function(req, res) {
    var self = this;
    var validRequest = self._checkRequest(req);
    
    if (!validRequest) {
        console.log("addImage: Invalid request");
        res.status(400).send("Invalid request");
        return;
    }
    
    console.log("addImage: Petition from: " + req.ip + ". Username: " + req.body.username);

    self.oxfordLib.recognizeImageB64(req.body.image, function(error, emotions){
        
        var store;
        
        if (error) {
            console.log ("addImage: ERROR: " + error);
            
            //Failure in connection with Oxford API: Setup to store without emotions
            store = new Image({
                username:    req.body.username,
                ip:          req.ip,
                date:        new Date(),
                image: 	     req.body.image
            });
            
        } else {
            //Extract main emotion
            var mainEmotionObj = self.oxfordLib.extractMainEmotion(emotions);

            if (mainEmotionObj === self.oxfordLib.emptyEmotion) {
                console.log("addImage: No emotion detected");
                res.status(400).send("No emotion detected in this image");
                return;
            }

            var mainEmotion = mainEmotionObj.emotion;

            console.log("addImage: Image recognition: " + mainEmotion + " (" + emotions + ")");

            store = new self.imageDB({
                username:    req.body.username,
                ip:          req.ip,
                date:        new Date(),
                image:       req.body.image,
                emotions:    emotions,
                mainemotion: mainEmotion
            });

            store.save(function (error, store) {
                if (error) {
                    res.status(500).send(error.message);
                } else {
                    res.status(200).send("Image stored correctly");
                }
            });
        }
    });

};

/*!
 * The exports object is an instance of Oxford.
 */
var images = module.exports = exports = new Images();