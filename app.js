var express       = require('express');
var path          = require('path');
//var favicon       = require('serve-favicon');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var mongoose      = require('mongoose');
var utils         = require('./lib/utils.js');
var exphbs        = require('express-handlebars');
var emoti         = require('./lib/emoti.js');


var app = express();

//app.enable('trust proxy');

app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit: '2mb', extended: true}));

// Connection to DB
mongoose.connect('mongodb://localhost/emoti', function(err, res) {
  if(err) throw err;
  console.log('Connected to Database');
});

utils.registerModels(app, mongoose);

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(methodOverride());

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

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');

/*Handlebars.registerHelper('base64decode', function(base64str) {
  return new Buffer(base64str, 'base64');
});*/

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
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

app.use('/', routes);
app.use('/api/images/', images);


var Image  = require('mongoose').model('Image');
Image.findOne(function (err, image) {
  if (err) throw err;
  if(!image) throw new Error("No image found in database");
  if (image.image) emoti.startEmotionDetect(image.image);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
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


module.exports = app;
