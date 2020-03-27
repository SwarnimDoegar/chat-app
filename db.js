let mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/chat-app?gssapiServiceName=mongodb', { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;
db.once('open', function () {
    console.log("we're connected!");
});