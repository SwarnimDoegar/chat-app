let date = new Date();
let utc_date = date.toUTCString();
let time = new Date(utc_date).toLocaleTimeString()
// console.log(typeof new Date(utc_date).toLocaleTimeString())
time = time.slice(0, 5);