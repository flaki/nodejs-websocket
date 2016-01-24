function str2ab(string) {
  return new TextEncoder("utf-8").encode(string);
}
function ab2str(arraybuffer) {
  return new TextDecoder("utf-8").decode(arraybuffer);
}

module.exports = function() {
  var ws = require("./index.js");
  var WS_PORT = 8080;

  var net = require('./net-fxos.js');
  var PORT = 80;

  var webserver;
  var socketserver;

  // Virtual GamePad object
  var VGP = {
    buttons: [
      { pressed: false },
      { pressed: false },
      { pressed: false },
      { pressed: false }
    ],
    axes: [
      0.0,
      0.0,
      0.0,
      0.0
    ]
  };

  console.log("FirefoxOS-Remote using net-fxos starting...", net);

  function initServer(ip) {
  	console.log("Creating webserver on ",ip,":",PORT);
    webserver = net.createServer().listen(PORT);

    // Init remote control socket
    initSocketServer(ip);

    // Init nfc url sharer
    initNFC(ip);

    webserver.on("connection", function(socket) {
      console.log("New Web UI connection...");
      socket.on("data",function(data) {
        console.log("Request: ", ab2str(data));

        //var out = '<html><head></head><body style="background-color: purple">REMOTE ON <ip/>!</body></html>'.replace('<ip/>',ip);
        // Serve remote control UI from local package (remote.html)
        fetch("remote.html").then(function(r) {
          return r.text();
        }).then(function (out) {
          out = out.replace('<ip/>',ip);
          socket.write("HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: "+(out.length)+"\r\nConnection: close\r\n\r\n" + out);
        }).catch( function (e) { console.error(e) });
      });
    });
  }

  function getIP() {
    console.log('searching locally broadcasted IP addresses...');
    var ip = require('./ip-utils.js');
    ip.getAddresses(function(addr) {
      console.log("found ip addresses: ", addr);
      if (typeof addr !== "object") return initServer(addr);

      var ip;
      for (ip in addr) {
        return initServer(addr[ip]);
      }
    });
  }

  function initSocketServer(ip) {
    socketserver = ws.createServer(function (connection) {
      console.log("Controller connected on port ", WS_PORT);

      connection.on("text", function (str) {
        console.log("[",str,"]");

        try {
          var j = JSON.parse(str);

          VGP.axes = j.axes;
          VGP.buttons = j.buttons;
        } catch (e) {
          if (str === "RESPAWN") {
            return respawnPlayer(-1);
          }
          console.log("Invalid remote descriptor received!");
        }

//        VGP.buttons[0].pressed = true;
//        setTimeout(function() {
//          VGP.buttons[0].pressed = false;
//        },100);
      });

      connection.on("close", function () {
        console.log("Connection closed");
      });

    });

    console.log("FxOS-Remote server starting on WS port ",WS_PORT,"...");
    socketserver.listen(WS_PORT);

    // Initialize Virtual GamePad
    initVGP();
  }

  function initVGP() {
    var ggp;
    if ("getGamepads" in navigator) ggp = navigator.getGamepads;

    navigator.getGamepads = function() {
      return [
        VGP
      ];
    };
    navigator.getGamepads._getGamepads = ggp;
  }

  function initNFC(ip) {
    var mozNfc = window.navigator.mozNfc;// TODO change var name

    // TODO: if "access": "readwrite" is in the nfc permissions field we...
    // don't have access to the API! which makes no sense?
    if(!mozNfc) {
      console.error('NFC API not available');
    } else {
      console.log('NFC available');
    }

    if(!mozNfc.enabled) {
      console.log('NFC is available, but not enabled');
    }

    mozNfc.onpeerfound = function(e) {
      console.log('NFC PEER!!!', e.peer);

      var peer = e.peer;
      var url = 'http://' + ip;
      var ndefHelper = new NDEFHelper();
      var record = ndefHelper.createURI(url);

      peer.sendNDEF([record]).then(function () {
        console.log('SENT URL ' + url);
      }).catch(function (err) {
        console.error('NFC ERROR: ', err);
      });
    }


    window.addEventListener('beforeunload', function() {
      console.log('STOPPING NFC SERVER');
      shutdownNFC();
    });
  }

  function shutdownNFC() {
    window.navigator.mozNfc.onpeerfound = null;
  }


  getIP();
}

// Launch bundle
window.addEventListener("load", function () {
  module.exports();
});
