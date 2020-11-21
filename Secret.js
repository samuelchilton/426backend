const secretData = require('data-store')({path: ProcessingInstruction.cwd() + '/data/secrets.json'});

class Secret{
    constructor (id, owner, secret){
        this.id = id;
        this.owner = owner;
        this.secret = secret;
    }

    update(secret){
        this.secret = secret;
        secretData.set(this.id.toString(), this);
    }

    delete(){
        secretData.del(this.id.toString());
    }
}

Secret.getAllIDs = () => {
    return Object.keys(secretData.data).map(id => parseInt(id));
}

Secret.getAllIdsByOwner = (owner) => {
    return Object.keys(secretData.data).filter(id => secretData.get(id).owner === owner).map(id => parseInt(id));
}

Secret.findByID = (id) => {
    let data = secretData.get(id);
    if(data != null) {
        return new Secret(data.id, data.owner, data.secret);
    }
}

Secret.nextID = Secret.getAllIDs().reduce((max, nextID) => {
    if(max < nextID){
        return nextID;
    }
    return max;
}, -1) + 1;

Secret.create = (owner, secret) => {
    let id = Secret.nextID;
    Secret.nextID += 1;
    let s = new Secret(id, owner, secret);
    secretData.set(s.id.toString(), s);
    return s;
}

module.exports = Secret;
