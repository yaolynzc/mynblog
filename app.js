var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');
// var users = require('./routes/users');
var settings = require('./settings');
var flash = require('connect-flash');
//日志写入文件
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log',{flags:'a'});
var errorLog = fs.createWriteStream('error.log',{flags:'a'});

var app = express();
//添加passport认证中间件
var passport = require('passport'),
    GithubStrategy = require('passport-github').Strategy;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(logger({stream:accessLog}));  //日志记录
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//记录错误日志
app.use(function(err,req,res,next){
  var meta = '[' + new Date() + ']' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
})

app.use(session({
  secret:settings.cookieSecret,
  key:settings.db,    //cookie name
  cookie:{maxAge:1000 * 60 * 60 * 24 * 30},   //30 days
  resave:false,
  saveUninitialized:true,
  store:new MongoStore({
    // db:settings.db,
    // host:settings.host,
    // port:settings.port
    url:'mongodb://' + settings.host + ":" + settings.port + "/" + settings.db
  })
}));

// 文件上传插件multerV1.2.0
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
var upload = multer({ storage: storage });
var cpUpload = upload.any();
app.use(cpUpload);

// app.use('/', routes);
// app.use('/users', users);
app.use(passport.initialize()); //初始化passport
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

passport.use(new GithubStrategy({
  clientID:"5387c44a487ed0cb23fc",
  clientSecret:"a782274d4fc846f3fa21c65b7018e0a3a5ed0d3e",
  callbackURL:"http://localhost:3000/login/github/callback"
},function(accessToken,refreshToken,profile,done){
  done(null,profile);
}));

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
