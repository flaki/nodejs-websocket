var net = require('./net-fxos.js');
var PORT = 8081;

console.log("firefoxos-echo using net-fxos starting...", net);

module.exports = function() {

  console.log('searching locally broadcasted IP addresses...');
  var ip = require('./ip-utils.js');
  ip.getAddresses(function(addr) {
    console.log("found ip addresses: ",addr);
  })

  console.log("creating server...");
  var server = net.createServer().listen(PORT);
  console.log("listening on ",PORT);

  server.on("connection",function(socket) {
    console.log("new connection: ",socket);
    socket.on("data",function(d) {
      console.log("Received ",d.byteLength," bytes, echoing back ",d);
      socket.write(d);
    });
  });
};
