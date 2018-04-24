const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
const app = express();
const port = 9876;
const basePath = '/api/teamMembers';
const url = 'mongodb://localhost:27017/marbs';
const collectionName = 'marbs';
const nextIdCollection = 'next-id';
const loginCollection = 'login';
var mongoDataBase;

let teamMembers = [
    {  name: 'Derek Bodi', halfDaysBanked: 3, datesTakenOff: [
      '2017-03-16' , '2017-02-13', '2018-01-03', '2017-07-03', '2017-12-23'
    ] },
    { name: 'Nick Angelo', halfDaysBanked: 4, datesTakenOff: [
      '2017-03-16' , '2017-02-13', '2018-01-03', '2017-07-03', '2017-12-23'
    ] },
    { name: 'Rachael Jenkins', halfDaysBanked: 1, datesTakenOff: [
      '2017-03-16' , '2017-02-13', '2018-01-03', '2017-07-03', '2017-12-23'
    ] },
    { name: 'Sebastian Salomone', halfDaysBanked: 0, datesTakenOff: [
      '2017-03-16' , '2017-02-13', '2018-01-03', '2017-07-03', '2017-12-23'
    ] },
    { name: 'Zach McGuire', halfDaysBanked: 0, datesTakenOff: [
      '2017-03-16' , '2017-02-13', '2018-01-03', '2017-07-03', '2017-12-23'
    ] }
  ];

app.use(cors());
app.use(bodyParser.json());

MongoClient.connect(url, (err, db) => {
    assert.equal(null, err);
    console.log('Connected to Mongo');
    mongoDataBase = db;

    var col = mongoDataBase.collection(loginCollection);
    //     reset();
});

app.listen(port, () => {
    console.log('Server Started');
});

getNextId = () => {
    return new Promise(
        (resolve, reject) => {
            const collection = mongoDataBase.collection(nextIdCollection);
            collection.find({}).toArray((err1, data) => {
                assert.equal(err1, null);
                let nextId = data[0].nextId;    
                collection.update({}, { nextId: nextId + 1 }, (err2, data) => {
                    assert.equal(err2, null);
                    resolve( nextId );
                })
            });
        }
    );
}

// get members
app.route(basePath).post((req, res) => {
    checkValidCredentials(req.body.username, req.body.password).then(() => {
    let filterParams = {};
    if (req.body.id !== undefined) {
        filterParams = { "id" : parseInt(req.body.id, 10) };
    }
    console.log(filterParams);
    const collection = mongoDataBase.collection(collectionName);
    collection.find(filterParams, {_id: 0}).toArray((err, members) => {
        assert.equal(err, null);
        res.send({
            data: members
        });
    });
    console.log('members retrieved');

    }, error => {
        res.status(401).send({ data: {} , error });
    }); 
});

// edit member
app.route(basePath).put((req, res) => {
    checkValidCredentials(req.body.username, req.body.password).then(() => {

    let reqbody = req.body;
    let id = parseInt(reqbody.id, 10);
    const collection = mongoDataBase.collection(collectionName);
    collection.update({ id }, reqbody, (err, result) => {
        assert.equal(err, null);
        if(result.result.n > 0) {
            res.send({
                data: reqbody
            });
        } else {
            res.status(404).send({
                data: {},
                error: "Supplied ID doesn't match a user in the database"
            });
        }       
    });    

    }, error => {
        res.status(401).send({ data: {} , error });
    }); 
});

// add member
app.route(basePath + "/create").post((req, res) => {
    checkValidCredentials(req.body.username, req.body.password).then(() => {

    let reqbody = req.body;
    console.log(reqbody.halfDaysBanked);
    console.log(reqbody.datesTakenOff);

    if(reqbody.halfDaysBanked === undefined) {
        reqbody.halfDaysBanked = 0;
    }
    if(reqbody.datesTakenOff === undefined) {
        reqbody.datesTakenOff = [];
    }

    if (verifyBodyIsCorrectForm(reqbody)) {
        getNextId().then((nextId) => {
            console.log('Got ID');
            reqbody.id = nextId;        
            var collection = mongoDataBase.collection(collectionName);
            collection.insert(reqbody, (err, result) => {
                assert.equal(err, null);
                res.status(201).send({
                    data: reqbody
                });
            });
        });    
    } else {
        res.status(400).send({
            data: {},
            error: `Body didn't match the expected form. Req: ${req}`
        });
    }     
    
    }, error => {
        res.status(401).send({ data: {} , error });
    }); 
});

// delete member
app.route(basePath).delete((req, res) => {
    checkValidCredentials(req.body.username, req.body.password).then(() => {

    const id = parseInt(req.body.id, 10);
    var collection = mongoDataBase.collection(collectionName);
    collection.deleteOne({ id }, (err, result) => {
        assert.equal(err, null);
        if (result.result.n > 0) {
            res.send({
                data: {}
            });
        } else {
            res.status(404).send({
                data: {},
                error: "Supplied ID doesn't match a user in the database"
            })
        }       
    });    

    }, error => {
        res.status(401).send({ data: {} , error });
    }); 
});

//login
app.route(basePath + '/login').post((req,res) => {
    let username = req.body.username;
    let password = req.body.password;
    checkValidCredentials(username, password).then(() => {
        res.send({data: true});
    }, error => {
        res.status(401).send({ data: false , error });
    });  
});

checkValidCredentials = (username, password) => new Promise((resolve, reject) => {
    let collection = mongoDataBase.collection(loginCollection);
    collection.findOne({username: username}, (err, result) => {
        if (result === null) {
            reject("username is invalid");
            return;
        }
        if(result.password === password) {
            resolve();
        } else {
            reject("password is invalid");
        }
    });
});

reset = () => {
    console.log('Database Reset');
    // resets the id collection
    console.log('   Reseting Ids');
    var idCol = mongoDataBase.collection(nextIdCollection); 
    idCol.deleteMany({}, (idDeleteError, idDeleteResult) => {
        assert.equal(idDeleteError, null);
        idCol.insert({nextId: 1}, (idAddError, idAddResult) => {
            assert.equal(idAddError, null);

            // resets the login collection
            console.log('   Reseting Login credentials');
            var loginCol = mongoDataBase.collection(loginCollection);
            loginCol.deleteMany({}, (loginDeleteError, loginDeleteResult) => {
                assert.equal(loginDeleteError, null);
                loginCol.insert({username: 'manager', password: 'password'}, (loginAddError, loginAddResult) => {
                    assert.equal(loginAddError, null);

                    // resets the user database
                    console.log('   Reseting Users');
                    var userCol = mongoDataBase.collection(collectionName);
                    userCol.deleteMany({}, (userDeleteError, userDeleteResult) => {
                        assert.equal(userDeleteError, null);
                        addTeamMember(userCol, 0);
                    });
                });
            });
        });        
    });    
}

addTeamMember = (collection, currentIndex) => {
    if(currentIndex >= teamMembers.length) {
        console.log('Reset Finished');
        return;
    } else {
        getNextId().then((nextId) => {
            
            let body = teamMembers[currentIndex];
            body.id = nextId;
            collection.insert(body, (err, result) => {
                assert.equal(err, null);
                addTeamMember(collection, currentIndex + 1);
            })
        });
    }
}

verifyBodyIsCorrectForm = body => {

    /*
        console.log(body.name !== null);
        console.log(body.halfDaysBanked !== null);
        console.log(body.datesTakenOff != null);
        console.log(typeof body.name == "string");        
        console.log(typeof body.halfDaysBanked == "number");
        console.log(typeof body.datesTakenOff == "object");
    */
    return body.name !== undefined && 
        body.halfDaysBanked !== undefined && 
        body.datesTakenOff != undefined && 
        typeof body.name == "string" && 
        typeof body.halfDaysBanked == "number" && 
        typeof body.datesTakenOff == "object";
}