let http = require('http');
let express = require('express');
let socketio = require('socket.io');
let cors = require('cors');
let getip = require('./getip');
let router = express.Router();
const mydb = require("./db");
let app = express();
let server = http.createServer(app);
let io = socketio(server);

app.use(cors());
app.use(router);

io.on('connection', function (socket) {
  socket.on('establish', function (user_handle, id) {
    mydb.updateSocketId(user_handle, id);
    mydb.setOnline(user_handle, true);
  })
  socket.on('new_message', async (data) => {
    console.log(socket.id, "    ", typeof data.from);
    await mydb.appendChat(data.from, data.to, data.from, data.message);
    let details = await mydb.getUserDetails(data.to);
    if (details.socket_id != 'offline') {
      socket.to(details.socket_id).emit('message', {
        from: data.from,
        message: data.message,
        chat_date_time: Date.now()
      })
    }

  })

});

server.listen(process.env.PORT || 3000, getip.myip, () => console.log(`Server has started.`));
