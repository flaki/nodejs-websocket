module.exports = function() {
  var ws = require("./index.js");
  var WS_PORT = 8081;


  var server = ws.createServer(function (connection) {
    console.log("* New connection on port ",WS_PORT);
    connection.nickname = null

    connection.on("text", function (str) {
      console.log("* Incoming message: ", str);

      if (connection.nickname === null) {
        connection.nickname = str;
        broadcast(str+" entered");
        console.log("* ",connection.nickname," entered");
      } else {
        broadcast("["+connection.nickname+"] "+str);
        console.log("* ",connection.nickname,": ",str);
      }
    });

    connection.on("close", function () {
      broadcast(connection.nickname+" left")
      console.log("* ",connection.nickname," left");
    });

  });

  console.log("FxOS WebSocket server starting on ",WS_PORT,"...");
  server.listen(WS_PORT);

  function broadcast(str) {
    server.connections.forEach(function (connection) {
      connection.sendText(str);
    });
  }
}
