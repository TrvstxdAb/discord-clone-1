var expressSession   = require("express-session"),
      User           = require("./models/user"),
      bodyParser     = require("body-parser"),
      express        = require("express"),
      config         = require("./config/config"),
      passport       = require("passport"),
      LocalStrategy  = require("passport-local"),
      mongoose       = require("mongoose"),
      bcrypt         = require("bcryptjs"),
      passportStrategy = require("./config/passport");

var app = express();

app.use(express.static(__dirname + "public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//Mongoose config
mongoose.connect(config.dbURL, function(err){
    if(err){
        throw err;
    }
});
mongoose.Promise = global.Promise;

//Passport configuration
app.use((expressSession)({
    secret: "a4fw8542071f-c33873-443447-8ee2321",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

//Login Strategy
passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true 
},passportStrategy.localSiginStrategy));

//Sign UP Strategy
passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
},passportStrategy.localSignupStrategy));

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});



//=========== Routes ===================
app.get("/", (req, res)=>{
    res.render("index");
});

//Login Routes
app.get("/users/login", (req, res)=>{
    res.render("login");
});

app.post("/users/login",passport.authenticate('local-login'), (req, res) =>{
    res.redirect("/users/"+ req.user._id);
});

//Register Routes
app.get("/users/register", (req, res)=>{
    res.render("register");
});

app.post("/users/register",passport.authenticate('local-signup', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/register', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}), (req, res) =>{
    console.log("User Registered");
});


//Users Profile
app.get("/users/:id", (req, res)=>{
    User.findById(req.params.id).then((rUser)=>{
        res.send(rUser);
    }).catch((e)=>{
        res.send(e);
    });
});



app.listen(config.port, ()=>{
    console.log("Server Listening at " + config.port);
});