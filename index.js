const express = require('express');
const app = express();
const cors = require('cors');

const parser = require('body-parser');

//app.use(cors());
const corsOptions = {
    origin: 'https://annbantukul.github.io',
    credentials: true,
};
app.use(cors(corsOptions));

const exressSession = require('express-session');
app.use(exressSession({
    name: "SessionCookie",
    secret: 'quickbrownfox',
    resave: false,
    saveUninitialized: false,
    proxy : true, // add this when behind a reverse proxy, if you need secure cookies
    cookie : {
        secure : true, // disable for localhost testing because it isn't secure
        maxAge: 5184000000, // 2 months but set to whatever floats your boat
        sameSite: "none",
    }
}));


app.use(parser.json());
app.use(parser.urlencoded({ extended: true }))


const Favorite = require('./Favorites.js');

const loginData = require('data-store')({path: process.cwd() + '/data/users.json'});

app.post('/test', (req, res) => {
    console.log("hi");
    res.json("hey");
    return;
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
    console.log("user signed up with username " + user + " and password " + password);
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
        res.json(true);
        console.log("user signed in with username" + user + " and password " + password); 
        
        return;
    }
    res.status(403).send("Unauthorized");
});

app.get('/logout', (req, res) => {
    delete req.session.user;
    res.json(true);
});

app.get('/favorite', (req, res) => {
    console.log(req.session.user);
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
    console.log("User setting favorite is " + req.session.user);
    if(req.session.user === undefined){
        res.status(403).send("Unauthorized because req.session.user is undefined...");
        return;
    }

    let f = Favorite.create(req.session.user.toString(), req.body.drinkName);
    console.log(Favorite.findByID(0).favorites + " is the first favorite for the user");
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
        console.log("req.session.user is undefined");
        return;
    }

    let f = Favorite.findByID(req.params.id);
    if(f == null){
        res.status(404).send("Not found...");
        return;
    }

    if(f.owner != req.session.user){
        res.status(403).send("Unauthorized...");
        console.log("f.owner does not equal req.session.user");
        return;
    }
    f.delete();
    res.json(true);
    return;
});
// const port = 3030;
// app.listen(port, () => {
//     console.log("User Login Example up and running on port " + port);
// });
app.listen(process.env.PORT || 3000, () => console.log("Server is running on port " + process.env.PORT + "..."));
