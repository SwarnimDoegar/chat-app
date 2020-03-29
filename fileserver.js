let http = require('http');
let express = require('express');
let session = require('express-session');
let getip = require('./getip');
let cors = require('cors');
let ejs = require('ejs');
let router = express.Router();
let bodyParser = require('body-parser');
let app = express();
let server = http.createServer(app);
let cookieParser = require('cookie-parser');
let mydb = require('./db');
let Users = [];
let socketMap = {};

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: "Abcd", resave: true, saveUninitialized: true }))
app.use(cookieParser());
app.use(cors());
app.use(router);
app.use(express.static(__dirname + '/public'));


function parseCookies(req) {
    let ReqCookie = req.headers.cookie;
    let Cookies = {};
    if (ReqCookie != undefined) {
        let indivCookies = ReqCookie.split(';');
        indivCookies.forEach((values) => {
            let tempCookie = values.split('=');
            tempCookie.forEach((value, index) => {
                tempCookie[index] = tempCookie[index].trim();
            })
            Cookies[tempCookie[0]] = tempCookie[1];
        })
    }
    return Cookies;
}

function setCookies(req) {
    Cookies = parseCookies(req);

}


router.get('/', (req, res) => {
    let sess = req.session;
    let reqCookies = parseCookies(req);
    if (reqCookies.User != undefined) {
        sess.user = reqCookies.User;
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.sendFile(__dirname + '/public/index.html');
    }
    else {
        return res.redirect("/login");
    }
})

router.post("/submit-form", async (req, res) => {
    form_data = req.body;
    mydb.loginUser(form_data.username, form_data.user_pass).then(result => {
        if (result) {
            if (form_data.keepMeLoggedIn == "on") {
                res.cookie('User', form_data.username, { httpOnly: true });
            }
            res.redirect('/');
        }
        else {
            console.log("Incorrect username or password")
        }
    })
})

router.get('/login', (req, res) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.sendFile(__dirname + "/public/login.html");
})
router.post('/logout', (req, res) => {
    reqCookies = parseCookies(req);
    delete socketMap[reqCookies.User];
    res.clearCookie('User');
    res.redirect("/session/destroy");
})
router.get('/session/destroy', (req, res) => {
    req.session.destroy();
    res.redirect("/login");
})
server.listen(process.env.PORT || 8080, getip.myip, () => console.log(`Server has started on ${getip.myip}:8080`));