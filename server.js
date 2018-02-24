let express=require('express');
let app=express();
let passport=require('passport'),
    bodyParser=require('body-parser'),
    LocalStrategy=require('passport-local'),
    passportLocalMongoose=require('passport-local-mongoose');

let User=require('./models/user');
let mongoose=require('mongoose');

mongoose.connect('mongodb://localhost/auth_demo');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(require('express-session')({
    secret: "Keyboard cat",
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', function (req, res) {
   res.render('home.ejs');
});

app.get('/secret', isLoggedIn, function (req, res) {
   //res.redirect(__dirname+'views/secret.ejs');
    res.render('secret.ejs');
});

//Auth ROUTES....
app.get('/register', function (req, res) {
   res.render('register.ejs')
});

app.post('/register', function (req, res) {
   //res.send("REGISTER POST ROUTE");

    User.register(new User({username: req.body.username}), req.body.password, function (err, user) {
        if(err){
            console.log(err);
            return res.render('register.ejs');
        }

        passport.authenticate('local')(req, res, function () {
            // If you are using redirect do not use the extension, and use slash...
            res.redirect('/login');
        });
    })
});

app.get('/login', function (req, res) {
   res.render('login.ejs');
});

//Main logic area...
app.post('/login', passport.authenticate('local',{
    successRedirect:'/secret',
    failureRedirect:'/login'
}), function (req, res) {
    
});

//Logout page...
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

//Function to check if the user is logged in or not?? It's a middleware...
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}


app.listen(process.env.PORT|| 3050, function () {
   console.log('Magic happens at port 3050')
});