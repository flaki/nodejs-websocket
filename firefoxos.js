module.exports = function() {
  //var http = require("http")
  //var fs = require("fs")
  //http.createServer(function (req, res) {
  //  fs.createReadStream("index.html").pipe(res)
  //}).listen(8080)

  var ws = require("./index.js");
  var WS_PORT = 8081;


  var server = ws.createServer(function (connection) {
    console.log("Listening on port ",WS_PORT);
    connection.nickname = null

    connection.on("text", function (str) {
      console.log("Incoming message: ", str);

      if (connection.nickname === null) {
        connection.nickname = str;
        broadcast(str+" entered");
        console.log("> ",nickname," entered");
      } else {
        broadcast("["+connection.nickname+"] "+str);
        console.log("> ",nickname,": ",str);
      }
    });

    connection.on("close", function () {
      broadcast(connection.nickname+" left")
      console.log("> ",nickname," left");
    });

  });

  console.log("FxOS Webserver starting...");
  server.listen(WS_PORT);

  function broadcast(str) {
    server.connections.forEach(function (connection) {
      connection.sendText(str);
    });
  }
}
