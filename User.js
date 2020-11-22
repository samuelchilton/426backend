const userList = require('data-store')({path: process.cwd() + '/data/userList.json'});

class User{
    constructor (user, password){
        this.user = user;
        this.password = password;
    }
    /**
     * Deletes the entire list for a given user. Should not be used unless
     * we impliment a clear favorites button
     * @returns True
     */
    delete(){
        userList.del(this.user);
        return true;
    }
}

// User.getAllIDs = () => {
//     return Object.keys(userList.data).map(id => parseInt(id));
// }

// Favorites.getAllIdsByOwner = (owner) => {
//     return Object.keys(favoritesList.data).filter(id => favoritesList.get(id).owner === owner).map(id => parseInt(id));
// }

User.findUser = (user) => {
    let data = favoritesList.get(user);
    if(data != null) {
        return new User(data.user, data.password);
    }
}

// User.nextID = User.getAllIDs().reduce((max, nextID) => {
//     if(max < nextID){
//         return nextID;
//     }
//     return max;
// }, -1) + 1;

User.create = (user, password) => {
    console.log("User: " + user + " Password: " + password);
    let u = new User(user, password);
    console.log("User inside user.js is " + u.user);
    userList.set(u.user.toString(), u);
    return u;
}

module.exports = User;
