const express = require('express');
const session = require('express-session');
const getip = require('./getip');
const cors = require('cors');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mydb = require('./db');
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session);
mongoose.connect('mongodb://127.0.0.1:27017/chat-app?gssapiServiceName=mongodb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: "76tfvbji876rdcdw234rfvbnjko",
    resave: false,
    saveUninitialized: true,
    name: "user",
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    unset: "destroy"
}));
app.use(cookieParser());
app.use(cors());

app.get('/', async (req, res) => {
    if (req.session && (req.session.user || req.session.tempUser)) {
        let user = req.session.user ? req.session.user.user_handle : req.session.tempUser.user_handle;
        let isUserOnline = await mydb.checkOnline(user);
        if (isUserOnline) {
            let sockid = await mydb.fetchSocketId(user);
            if (sockid == 'offline')
                return res.sendFile(__dirname + "/public/index.html");
            else {
                // await mydb.updateSocketId(user, "offline")
                // await mydb.setOnline(user, false);
                req.session.destroy()
                res.redirect('/login');
            }
        }
        else {
            return res.sendFile(__dirname + "/public/index.html");
        }
    }
    else {
        req.session.destroy();
        res.redirect("/login");
    }
});

app.route('/login').get((req, res) => {
    if (req.session && (req.session.user || req.session.tempUser))
        res.redirect('/')
    else
        res.sendFile(__dirname + "/public/login.html")
}).post((req, res) => {
    const reqBody = req.body;
    if (reqBody) {
        mydb.loginUser(reqBody.username, reqBody.user_pass).then(async (result) => {
            if (result) {
                let online = await mydb.checkOnline(reqBody.username)
                if (online) {
                    return res.send("You are already logged in from other device");
                }
                mydb.setOnline(reqBody.username, true);
                if (reqBody.keepMeLoggedIn == 'on') {
                    req.session.user = result;
                    res.redirect("/");
                }
                else {
                    req.session.tempUser = result;
                    res.redirect("/");
                }
            }
            else {
                res.send("Incorrect Username or Password");
            }
        })
    }
})
app.get('/getUser', (req, res) => {
    if (req.session) {
        if (req.session.tempUser)
            return res.send(req.session.tempUser.user_handle)
        if (req.session.user)
            return res.send(req.session.user.user_handle)
    }
})
app.get('/getContactPane', async (req, res) => {
    let doc = {};
    if (req.session) {
        if (req.session.user) {
            doc = await mydb.fetchContactPaneDetails(req.session.user.user_handle);
        }
        else if (req.session.tempUser) {
            doc = await mydb.fetchContactPaneDetails(req.session.tempUser.user_handle);
        }
    }
    return res.send(doc);
})
app.get('/session/destroy', async (req, res) => {
    if (req.session && req.session.tempUser) {
        await mydb.updateSocketId(req.session.tempUser.user_handle, "offline")
        await mydb.setOnline(req.session.tempUser.user_handle, false);
        req.session.destroy();
        res.clearCookie("user");

    }
    if (req.session && req.session.user) {
        await mydb.updateSocketId(req.session.user.user_handle, "offline")
        await mydb.setOnline(req.session.user.user_handle, false);
    }
})
app.route('/logout').post(async (req, res) => {
    if (req.session && req.session.user) {
        await mydb.updateSocketId(req.session.user.user_handle, "offline")
        await mydb.setOnline(req.session.user.user_handle, false);
    }
    if (req.session && req.session.tempUser) {
        await mydb.updateSocketId(req.session.tempUser.user_handle, "offline")
        await mydb.setOnline(req.session.tempUser.user_handle, false);
    }
    req.session.destroy(function (err) {
        if (err) {
            return next(err);
        } else {
            return res.redirect('/login');
        }
    });

})

app.get("/test", (req, res) => {
    let handle;
    if (req.session) {
        if (req.session.user) {
            handle = req.session.user.user_handle
        }
        else if (req.session.tempUser) {
            handle = req.session.tempUser.user_handle
        }
    }
    console.log(handle + " in test");
    mydb.fetchContactPaneDetails(handle).then(async (result) => {
        let user = await mydb.getUserDetails(handle);
        if (result)
            res.render("index", { contacts: result, user: user });
    })
})
app.use(express.static(__dirname + '/public'));
app.listen(process.env.PORT || 8080, getip.myip, () => console.log(`Server has started on ${getip.myip}:8080`));