const favoritesList = require('data-store')({path: process.cwd() + '/data/favoritesList.json'});

class Favorites{
    constructor (id, owner, favorites){
        this.id = id;
        this.owner = owner;
        this.favorites = favorites;
    }
    /**
     * Takes in a cocktail name and adds it to the favorites list
     * @returns True
     */
    update(favorite){
        this.favorites = this.favorites;
        favoritesList.set(this.id.toString(), this);
        return true;
    }

    /**
     * Deletes the entire list for a given user. Should not be used unless
     * we impliment a clear favorites button
     * @returns True
     */
    delete(){
        favoritesList.del(this.id.toString());
        return true;
    }
}

Favorites.getAllIDs = () => {
    return Object.keys(favoritesList.data).map(id => parseInt(id));
}

Favorites.getAllIdsByOwner = (owner) => {
    return Object.keys(favoritesList.data).filter(id => favoritesList.get(id).owner === owner).map(id => parseInt(id));
}

Favorites.findByID = (id) => {
    let data = favoritesList.get(id);
    if(data != null) {
        return new Favorites(data.id, data.owner, data.secret);
    }
}

Favorites.nextID = Favorites.getAllIDs().reduce((max, nextID) => {
    if(max < nextID){
        return nextID;
    }
    return max;
}, -1) + 1;

Favorites.create = (owner, secret) => {
    let id = Favorites.nextID;
    Favorites.nextID += 1;
    let f = new Favorites(id, owner, secret);
    favoritesList.set(f.id.toString(), f);
    return f;
}

module.exports = Favorites;
