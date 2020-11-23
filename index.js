const express = require('express');
const app = express();
const cors = require('cors');

const parser = require('body-parser');
app.use(cors());
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }))
const corsOptions = {
    origin: 'https://annbantukul.github.io/',
    optionsSuccessStatus: 200,
    credentials: true,
};
const exressSession = require('express-session');
app.use(cors(corsOptions));
app.use(exressSession({
    name: "SessionCookie",
    secret: 'quickbrownfox',
    resave: false,
    saveUninitialized: false,
    // proxy: true,
    // cookie:{
    //     secure: true,
    // },
}));



const Favorite = require('./Favorites.js');
const User = require('./User.js');

const loginData = require('data-store')({path: process.cwd() + '/data/users.json'});

app.post('/test', (req, res) => {
    console.log("inside test");
    res.send("It worked for post...");
});

app.get('/test', (req, res) => {
    console.log("inside test");
    res.send("It worked get...");
});

app.post('/signup', (req, res) => {
    let user = req.body.user;
    let password = req.body.password;

    let existingUser = loginData.get(user);
    if(existingUser !== undefined){
        res.status(403).send("User already exists...");
    }
    loginData.set(user.toString(), {'user': user, 'password': password});
    res.json(loginData.get(user));
    return;
});

app.post('/login', (req, res) => {
    let user = req.body.user;
    let password = req.body.password;

    let userData = loginData.get(user);
    if(userData == null){
        res.status(404).send("Not found...");
        return;
    }

    if(userData.password === password){
        console.log("User logged in...");
        req.session.user = user;
        console.log("req.session.user = " + req.session.user);
        res.json(true);
        return;
    }

    res.status(403).send("Unauthorized");
});

app.get('/logout', (req, res) => {
    delete req.session.user;
    res.json(true);
});

app.get('/favorite', (req, res) => {
    if(req.session.user === undefined){
        res.status(403).send("Unauthorized...");
        return;
    }

    res.json(Favorite.getAllIdsByOwner(req.session.user));
    return;
});

app.get('/favorite/:id', (req, res) => {
    if(req.session.user === undefined){
        res.status(403).send("Unauthorized...");
        return;
    }

    let f = Favorite.findByID(req.params.id);

    if(f == null) {
        res.status(404).send("Not found...");
        return;
    }
    if(f.owner != req.session.user){
        res.status(403).send("Unauthorized...");
    }
    res.json(f);
    return;
});

app.post('/favorite', (req, res) => {
    console.log("User setting favoret is " + req.session.user);
    if(req.session.user === undefined){
        res.status(403).send("Unauthorized...");
        return;
    }

    let f = Favorite.create(req.session.user, req.body.drinkName);
    console.log(Favorite.findByID(0) + " is the first favorite for the user");
    if(f == null){
        res.status(400).send("Bad request...");
        return;
    }
    res.json(f);
    return;
});

app.put('/favorite/:id', (req, res) => {
    if(req.session.user === undefined){
        res.status(403).send("Unauthorized...");
        return;
    }

    let f = Favorite.findByID(req.params.id);

    if(f == null){
        res.status(404).send("Not found...");
        return;
    }

    if(f.owner != req.session.owner){
        res.status(403).send("Unauthorized...");
        return;
    }

    f.update(req.body.secret);

    res.json(f.id);
    return;
});

app.delete('/favorite/:id', (req, res) => {
    if(req.session.user === undefined){
        res.status(403).send("Unauthorized...");
        return;
    }

    let f = Favorite.findByID(req.params.id);
    if(f == null){
        res.status(404).send("Not found...");
    }

    if(f.owner != req.session.owner){
        res.status(403).send("Unauthorized...");
        return;
    }
    f.delete();
    res.json(true);
    return;
});

app.listen(process.env.PORT || 3000, () => console.log("Server is running on port " + process.env.PORT + "..."));