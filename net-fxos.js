var events = require('events');
var util = require('util');


function Server(callback) {
  // Events:
  // close, connection, error, listening
  this._callback = callback;
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
    console.log("[mozTCPSocket] connection on :"+server._port);
    var socket = new Socket(connectEvent);

    if (server._callback) {
      server._callback(socket);
    }

    if (callback) {
      callback(socket);
    }

    server.emit("connection", socket);
  };

  this._server.onerror = function (err) {
    console.log("[mozTCPSocket] error creating server! ", err);
  };

  server.emit("listening");
  console.log("[mozTCPSocket] listening on :"+server._server.localPort);
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

    console.log(" >> ");
    socket._buffer = data;
    socket.emit('readable');

    console.log(" >> ", data.buffer ? data.buffer : data, arrayBufferToString(data));
    socket.emit("data", new Buffer(data));
  }
}

util.inherits(Socket, events.EventEmitter);

Socket.prototype.read = function() {
  if (!this._buffer) {
    console.log('[mozTCPSocket] no data in read buffer yet!');
    return null;
  }

  var buffer = new Buffer(this._buffer);
  this._buffer = null;
  return buffer;
}

Socket.prototype.write = function (data, encoding, callback) {
  if (typeof callback === 'undefined') {
    // TODO: optional
    if (typeof encoding === 'undefined') {
      // TODO: optional
    } else if (typeof encoding === 'function') {
      callback = encoding;
    }
  }

  if (typeof data === "string") {
    data = str2ab(data);
  }

  console.log(" << ", data.buffer ? data.buffer : data, arrayBufferToString(data));

  this._socket.send(data.buffer ? data.buffer : data);

  if (callback) {
      callback();
  }
}

Socket.prototype.end = function (data, encoding) {
  this.write(data, encoding);
}

function connect(port,host,callback) {
  // TODO: net.connect([options][, connectListener])
}
function createServer(options, callback) {
  var server = new Server(callback);

  // TODO: net.createServer([options][, connectionListener])
  return server;
}

console.log("[net-fxos] starting up...");
module.exports = {
  //Server: Server, // no need to expose this
  Socket: Socket,
  createServer: createServer,
  connect: connect
};


function arrayBufferToString(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf)).replace(/\r/g,'\\r').replace(/\n/g,'\\n');
}
function str2ab(string) {
  return new TextEncoder("utf-8").encode(string);
}
function ab2str(arraybuffer) {
  return new TextDecoder("utf-8").decode(arraybuffer);
}
