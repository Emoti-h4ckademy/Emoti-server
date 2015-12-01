var express       = require('express');
var path          = require('path');
var favicon       = require('serve-favicon');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var mongoose      = require('mongoose');
var utils         = require('./lib/utils.js');
var exphbs        = require('express-handlebars');


var app = express(),
    dev = app.get('env') === 'development' || 'demo';

//app.set('env', 'demo');

app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit: '2mb', extended: true}));



utils.initializeDatabase(app, mongoose, function (error) {
   if (error) {
       console.log ("Could not initialize database. Check if MongoDB service is up");
       process.exit(1);
   } 
});



// view engine setup
var hbs = exphbs.create({
  // Specify helpers which are only registered on this instance.
  helpers: {
    base64decode: function(base64str) {
      var bitmap = new Buffer(base64str, 'base64');
      //return new Buffer(base64str, 'base64');
      return bitmap;
    },
    debug: function(value){
      console.log("Current Context");
      console.log("======================");
      console.log(this);

      if(value) {
        console.log("Value");
        console.log("======================");
        console.log(value);
      }

    }
  }
});

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.set('views', path.join(__dirname, 'views'));

/*Handlebars.registerHelper('base64decode', function(base64str) {
  return new Buffer(base64str, 'base64');
});*/


// Middlewares
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(methodOverride());
app.use(logger(dev ? 'dev' : {
  stream: require('fs').createWriteStream('log')
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));


app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/index');
var images = require('./routes/api/images');
var charts = require('./routes/api/charts');

app.use('/', routes);
app.use('/api/images/', images);
app.use('/api/charts/', charts);

//var open = require('open');
//open("http://localhost:3000/show-images");


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (dev) {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var chokidar = require('chokidar');
var fs = require('fs');
var imageDB = require('./controllers/images');

//var watcher = chokidar.watch('/home/algunenano/Dropbox/Camera Uploads/', {
//  ignored: /[\/\\]\./, persistent: true
//});
//
//var initialScan = false;
//
//watcher
//    .on('addDir', function(path) { console.log('Directory', path, 'has been added'); })
//    .on('change', function(path) { console.log('File', path, 'has been changed'); })
//    .on('unlink', function(path) { console.log('File', path, 'has been removed'); })
//    .on('unlinkDir', function(path) { console.log('Directory', path, 'has been removed'); })
//    .on('error', function(error) { console.log('Error happened', error); })
//    .on('ready', function() { console.log('Initial scan complete. Ready for changes.'); initialScan = true; })
//    .on('raw', function(event, path, details) { console.log('Raw event info:', event, path, details); })
//    .on('add', function(path) {
//        if (initialScan) {
//            console.log('File', path, 'has been added');
//          
//            fs.readFile(path, function (error, data) {
//                if (error) {
//                    console.log("Demo error");
//                } else {
//                    myimage = data.toString('base64');
//                    imageDB.oxfordLib.recognizeImageB64(data, function(error, emotions) {
//                        var store;
//                        if (error) {
//                            console.log("Demo: No emotions detected. Error: "+ error);
//                            return;
//                        } else {
//
//                            //Extract main emotion
//                            var mainEmotionObj = imageDB.oxfordLib.extractMainEmotion(emotions);
//
////                            if (mainEmotionObj === imageDB.oxfordLib.emptyEmotion) {
////                                console.log("DEMO: No emotion detected");
////                                return;
////                            }
//
//                            var mainEmotion = mainEmotionObj.emotion;
//
//                            console.log("DEMO: Image recognition: " + mainEmotion + " (" + emotions + ")");
//                            
//                            store = new imageDB.imageDB({
//                                username:    "Demo",
//                                ip:          "Demo",
//                                date:        new Date(),
//                                image:       myimage,
//                                emotions:    emotions,
//                                mainemotion: mainEmotion
//                            });
//                        }
//
//                        store.save (function (error, store) {
//                            if (error) {
//                                console.log("Demo error DB");
//                            } else
//                                console.log("DEMO: New image added");
//                        });
//                    });
//                }
//            });
//                    
//        }
//    })
      



module.exports = app;
