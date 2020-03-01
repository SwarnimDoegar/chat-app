let http = require('http');
let express = require('express');
let socketio = require('socket.io');
let cors = require('cors');
let { myip } = require('./getip');
let router = express.Router();

router.get("/", (req, res) => {
  res.send({ response: "Server is up and running.", ip: myip }).status(200);
});

let app = express();
let server = http.createServer(app);
let io = socketio(server);

app.use(router);
app.use(cors());


io.on('connection', function (socket) {
  console.log(socket.id + " joined")
  socket.on('new_message', data => {
    console.log(socket.id, "    ", data);
    socket.broadcast.emit('message', data);
  })
});

server.listen(process.env.PORT || 3000, myip, () => console.log(`Server has started.`));
