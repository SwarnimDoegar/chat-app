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
// app.use((req, res, next) => {
//     if (req.cookies.user && !req.session.user && !req.session.tempUser) {
//         res.clearCookie('user');
//     }
//     next();
// });

app.get('/', (req, res) => {
    if (req.session && (req.session.user || req.session.tempUser)) {
        res.sendFile(__dirname + "/public/index.html");
    }
    else {
        req.session.destroy();
        res.redirect("/login");
    }
})

// router.post("/submit-form", async (req, res) => {
//     form_data = req.body;
//     mydb.loginUser(form_data.username, form_data.user_pass).then(result => {
//         if (result) {
//             if (form_data.keepMeLoggedIn == "on") {
//                 res.cookie('User', result, { httpOnly: true });
//                 res.redirect('/');
//             }
//             else {
//                 res.cookie('tempUser', mydb.randomString.generate(13), { httpOnly: true });
//                 res.redirect('/');
//             }
//         }
//         else {
//             res.send("Incorrect username or password")
//         }
//     })
// })

app.route('/login').get((req, res) => {
    if (req.session && (req.session.user || req.session.tempUser))
        res.redirect('/')
    else
        res.sendFile(__dirname + "/public/login.html")
}).post((req, res) => {
    const reqBody = req.body;
    if (reqBody) {
        mydb.loginUser(reqBody.username, reqBody.user_pass).then(result => {
            if (result) {
                if (reqBody.keepMeLoggedIn) {
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
app.get('/session/destroy', (req, res) => {
    if (req.session.tempUser) {
        req.session.destroy();
        res.clearCookie("user");
    }
})
app.post('/logout', (req, res) => {
    // res.clearCookie("user");
    req.session.destroy(function (err) {
        if (err) {
            return next(err);
        } else {
            return res.redirect('/login');
        }
    });

})

app.get("/test", (req, res) => {
    let handle = "@vtrrix"
    mydb.fetchContactPaneDetails(handle).then(async (result) => {
        let user = await mydb.getUserDetails(handle);
        if (result)
            res.render("index", { contacts: result, user: user });
    })
})
app.use(express.static(__dirname + '/public'));
app.listen(process.env.PORT || 8080, getip.myip, () => console.log(`Server has started on ${getip.myip}:8080`));