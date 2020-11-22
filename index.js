const express = require('express');
const app = express();

const parser = require('body-parser');
app.use(parser.json());

const exressSession = require('express-session');
app.use(exressSession({
    name: "SessionCookie",
    secret: 'quickbrownfox',
    resave: false,
    saveUninitialized: false,
}));

const Favorite = require('./Favorites.js');

const loginData = require('data-store')({path: process.cwd() + '/data/users.json'});
console.log("running");

app.get('/test', (req, res) => {
    console.log("inside test");
    res.json("Hello, world!");
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
    if(req.session.user === undefined){
        res.status(403).send("Unauthorized...");
        return;
    }

    let f = Sec.create(req.session.user, req.body.secret);
    if(f == null){
        res.status(400).send("Bad request...");
        return;
    }
    return res.json(f);
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