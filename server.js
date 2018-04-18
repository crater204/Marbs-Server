const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
const app = express();
const port = 9872;
const basePath = '/api/teamMembers';
const url = 'mongodb://localhost:27017/marbs';
const collectionName = 'marbs';
const nextIdCollection = 'next-id';
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


    var collection = mongoDataBase.collection(nextIdCollection);
        collection.insert({nextId: 1}, (err, result) => {
        console.log('result');
    });
    // reset();
});

app.listen(port, () => {
    console.log('Server Started');
});

getNextId = () => {
    return new Promise(
        (resolve, reject) => {
            const collection = mongoDataBase.collection(nextIdCollection);
            collection.find({}).toArray((err1, data) => {
                console.log(data);
                assert.equal(err1, null);
                let nextId = data[0].nextId;
                collection.update({}, { nextId: nextId + 1 }, (err2, data) => {
                    assert.equal(err2, null);
                    resolve( nextId );
                });      
            });
        }
    );
}

// get members
app.route(basePath).get((req, res) => {
    const collection = mongoDataBase.collection(collectionName);
    collection.find({}, {_id: 0}).toArray((err, members) => {
        assert.equal(err, null);
        res.send({
            data: members
        });
    });
    console.log('members retrieved');
});

// get member by id
app.route(basePath + '/:id').get((req, res) => {
    const id = parseInt(req.params['id'], 10);
    const collection = mongoDataBase.collection(collectionName);
    collection.findOne({ id }, {_id: 0}, (err, member) => {
        assert.equal(err, null);
        if( member !== null) {
            res.send({
                data: member
            }); 
        } else {
            res.status(404).send({
                data: {},
                error: "Supplied ID doesn't match a user in the database"
            });
        }
    });
});

// edit member
app.route(basePath).put((req, res) => {
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
});

// add member
app.route(basePath).post((req, res) => {
    let reqbody = req.body;
    console.log(reqbody.halfDaysBanked);
    console.log(reqbody.datesTakenOff);

    if(reqbody.halfDaysBanked === undefined) {
        console.log('Set HalfDays');
        reqbody.halfDaysBanked = 0;
    }
    if(reqbody.datesTakenOff === undefined) {
        console.log('Set DatesTakenOff');
        reqbody.datesTakenOff = [];
    }

    if (verifyBodyIsCorrectForm(reqbody)) {
        getNextId().then((nextId) => {
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
});

// delete member
app.route(basePath + '/:id').delete((req, res) => {
    const id = parseInt(req.params['id'], 10);
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
});

reset = () => {
    console.log('Database Reset');
    var collection = mongoDataBase.collection(collectionName);
    collection.deleteMany({}, (err, result) => {
        assert.equal(err, null);
        addTeamMember(collection, 0);
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
    return body.name !== null && 
        body.halfDaysBanked !== null && 
        body.datesTakenOff != null && 
        typeof body.name == "string" && 
        typeof body.halfDaysBanked == "number" && 
        typeof body.datesTakenOff == "object";
}