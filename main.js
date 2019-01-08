const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const users = require('./route/users.js');
const wallet = require('./route/wallet.js');

const app = express();

const port = process.env.PORT ||3000;

app.set('views', (__dirname + '/views'));
app.set('view engine', 'pug');

//body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json())

//      MIDDLEWARE FOR SESSIONS

app.use(session({
    secret: "i love programming",
    resave: true,
    saveUninitialized: true,
    //cookie:{maxAge:1000*20}
}));

//flash middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//passport
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use('/users', users);
app.use('/wallet', wallet);

app.get('/', (req,res) => {
    res.render('index',{tittle:'Index', message:'Index'})
})


app.listen(port, () => console.log(`server is running at http://localhost:${port}`));