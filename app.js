var config = require('./config.json');

var restify = require('restify');
var cradle = require('cradle');
var SerialPort = require("serialport").SerialPort;

var xbmc = require('./modules/xbmc.js');
var power_plug = require('./modules/rittal_pdu_7200.0014.js');

var serialPort = new SerialPort(config.serial.port, {
  baudrate: config.serial.baudrate
}, false);

serialPort.open(function (err) {
  if (err) {
     console.log(err);
     return;
  } else {
    power_plug.init(serialPort);
  }
});

function xbmcOff(req, res, next) {
  res.send(xbmc.off(config.xbmc.url, config.xbmc.user, config.xbmc.pw))
}
function xbmcOn(req, res, next) {
  res.send(xbmc.on(config.xbmc.mac))
}
function xbmcStatus(req, res, next) {
  res.send(xbmc.status(config.xbmc.url, config.xbmc.user, config.xbmc.pw))
}

function plugStatus(req, res, next) {
  res.send(power_plug.status(req.params.socket_name));
}
function plugOn(req, res, next) {
  res.send(power_plug.on(req.params.socket_name, req.params.plug_id));
}
function plugOff(req, res, next) {
  res.send(power_plug.on(req.params.socket_name, req.params.plug_id));
}

var server = restify.createServer({
    name : config.server.name
});

server.use(restify.CORS());
server.pre(restify.sanitizePath());
server.get('/xbmc' , xbmcStatus);
server.get('/xbmc/on' , xbmcOn);
server.get('/xbmc/off' , xbmcOff);
server.get('/power_plug/:socket_name' , plugStatus);
server.get('/power_plug/:socket_name/:plug_id/on' , plugOn);
server.get('/power_plug/:socket_name/:plug_id/off' , plugOff);

server.listen(config.server.port, config.server.url, function(){
    console.log('%s listening at %s:%s ', config.server.name , config.server.url, config.server.port);
});
