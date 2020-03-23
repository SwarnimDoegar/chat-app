let os = require('os');
let platform = os.platform();
let ifaces = os.networkInterfaces();
let myip = "";
//console.log(ifaces);
if (platform === 'linux') {
    myip = ifaces.wlp2s0[0].address;
}
else {
    myip = ifaces['Wi-Fi'][1].address;
}
//console.log(myip);
module.exports.myip = myip;
