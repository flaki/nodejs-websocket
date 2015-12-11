var events = require('events');
var util = require('util');


function Server() {
  // Events:
  // close, connection, error, listening
}

util.inherits(Server, events.EventEmitter);

Server.prototype.listen = function(port, callback) {
  // TODO: server.listen(options[, callback])
  // TODO: server.listen(port[, hostname][, backlog][, callback])

  var server = this;
  this._port = port;
  this._server = navigator.mozTCPSocket.listen(port,{
    binaryType: 'arraybuffer'
  });

  this._server.onconnect = function (connectEvent) {
    console.log("New Socket connection on ", server._port);
    var socket = new Socket(connectEvent);

    if (callback) {
      callback(socket);
    }

    server.emit("connection", socket);
  };

  this._server.onerror = function (err) {
    console.log("error creating server",err);
  };

  server.emit("Listening on ", server.localPort);
  return server;
};

Server.prototype.address = function() {};

Server.prototype.close = function() {};
Server.prototype.getConnections = function() {};
Server.prototype.ref = function() {};
Server.prototype.unref = function() {};


function Socket(options) {
  // Events:
  // close, data, drain, end, error, lookup, timeout
  var socket = this;
  this._socket = options.socket;

  this._socket.ondata = function (event) {
    var data = event.data;

    console.log(" >> ", data);
    socket.emit("data", data);
  }
}

util.inherits(Socket, events.EventEmitter);

Socket.prototype.write = function (data, encoding, callback) {
  if (typeof callback === 'undefined') {
    // TODO: optional
    if (typeof encoding === 'undefined') {
      // TODO: optional
    }
  }

  console.log(" << ", data);
  this._socket.send(data);
}


function connect(port,host,callback) {
  // TODO: net.connect([options][, connectListener])
}
function createServer(callback) {
  var server = new Server();

  // TODO: net.createServer([options][, connectionListener])
  return server;
}

console.log("Using `net-fxos`...");
module.exports = {
  //Server: Server, // no need to expose this
  Socket: Socket,
  createServer: createServer,
  connect: connect
};
