var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var audaciousCmd = require('./routes/audaciousCmd');
var audaciousApi = require('./api/audaciousApi.js');

var app = express();

// Socket.io setup
var myhttp = require('http').Server(app);
var io = require('socket.io')(myhttp);
io.on('connection', function(sockt){
  // socket = sockt;
  console.log('Socket.io: New connection');
  console.log('  '+sockt.id);
  console.log('  '+sockt.request.headers.cookie);
  console.log('  '+sockt.handshake.headers['user-agent']);
  io.emit('event', {data: 'songChange'});
});
io.on('reconnection', function (socket){
  console.log('Socket.io: Reconnection');
});
io.on('disconnect', function(){
  console.log('Socket.io: Disconnection')
});

app.use('/audacious/songChange', function (req, res){
  io.emit('event', {data: 'songChange'});
});

myhttp.listen(3001, function(){
  console.log('listening on *:3001');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/audaciousApi', audaciousApi);
app.use('/audaciousCmd', audaciousCmd);

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
