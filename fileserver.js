let http = require('http');
let express = require('express');
let session = require('express-session');
let getip = require('./getip');
let cors = require('cors');
let router = express.Router();
let bodyParser = require('body-parser');
let app = express();
let server = http.createServer(app);
let cookieParser = require('cookie-parser');
let randomstring = require('randomstring');
let Users = [];
let socketMap = {};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'abcd' }));
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
    if (Cookies.User === undefined) {
        let uid = "";
        moveback:
        while (true) {
            uid = randomstring.generate({
                length: 64,
                charset: 'alphanumeric'
            });
            if (socketMap[uid] === undefined) {
                socketMap[uid] = Cookies.io;
                return uid;
            }
            else break moveback;
            Users.push(uid);
            break;
        }

    }
}
function updateSocketID(Cookies) {
    socketMap[Cookies.User] = Cookies.io;
    console.log(JSON.stringify(socketMap));
}

router.get('/', (req, res) => {
    let sess = req.session;
    let reqCookies = parseCookies(req);
    if (reqCookies.User != undefined) {
        sess.user = reqCookies.User;
        updateSocketID(reqCookies);
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.sendFile(__dirname + '/public/index.html');
    }
    else {
        return res.redirect("/login");
    }
})

router.post("/submit-form", (req, res) => {
    uid = setCookies(req);
    res.cookie('User', uid, { httpOnly: true });
    req.session.user = uid;
    res.redirect('/');
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