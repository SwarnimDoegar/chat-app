let os = require('os');
let platform = os.platform();
let ifaces = os.networkInterfaces();
let myip = "";
// console.log(ifaces);
Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;
  
    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
  
      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        console.log(ifname + ':' + alias, iface.address);
      } else {
        // this interface has only one ipv4 adress
        myip=iface.address;
        // console.log(myip);
      }
      ++alias;
    });
  });
//console.log(myip);
module.exports.myip = myip;
