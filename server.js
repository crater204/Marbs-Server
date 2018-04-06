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
var mongoDataBase;

let teamMembers = [
    {  name: 'Derek Bodi', marblesEarned: 6, datesTakenOff: [
      '2017-03-16' , '2017-02-13', '2018-01-03', '2017-07-03', '2017-12-23'
    ] },
    { name: 'Nick Angelo', marblesEarned: 5, datesTakenOff: [
      '2017-03-16' , '2017-02-13', '2018-01-03', '2017-07-03', '2017-12-23'
    ] },
    { name: 'Rachael Jenkins', marblesEarned: 4, datesTakenOff: [
      '2017-03-16' , '2017-02-13', '2018-01-03', '2017-07-03', '2017-12-23'
    ] },
    { name: 'Sebastian Salomone', marblesEarned: 3, datesTakenOff: [
      '2017-03-16' , '2017-02-13', '2018-01-03', '2017-07-03', '2017-12-23'
    ] },
    { name: 'Zach McGuire', marblesEarned: 2, datesTakenOff: [
      '2017-03-16' , '2017-02-13', '2018-01-03', '2017-07-03', '2017-12-23'
    ] }
  ];

app.use(cors());
app.use(bodyParser.json());

MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log('Connected to Mongo');
    mongoDataBase = db;

    // reset();
});

app.listen(port, ()=> {
    console.log('Server Started');
});

function getNextId() {
    return new Promise(
        (resolve, reject) => {
            const collection = mongoDataBase.collection(nextIdCollection);
            collection.find({}).toArray((err1, data) => {
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
    collection.find({}).toArray((err, members) => {
        assert.equal(err, null);
        res.send({
            data: members
        });
    });
});

// get member by id
app.route(basePath + '/:id').get((req, res) => {
    const id = parseInt(req.params['id'], 10);
    const collection = mongoDataBase.collection(collectionName);
    collection.findOne({ id: id }, (err, member) => {
        assert.equal(err, null);
        if( member != null) {
            res.send({
                data: member
            }); 
        } else {
            res.send({
                data: {}
            });
        }
    });
});

// Edit member
app.route(basePath).put((req, res) => {
    let reqbody = req.body;
    let id = parseInt(reqbody.id, 10);

    const collection = mongoDataBase.collection(collectionName);
    collection.update({ id : id },  reqbody, (err, result) => {
        assert.equal(err, null);
        let numberModified = result.result.n;
        if(numberModified > 0) {
            res.send({
                data: reqbody
            });
        } else {
            res.send({
                data: {}
            })
        }
        
    });    
});

// add member
app.route(basePath).post((req, res) => {
    let reqbody = req.body;
    getNextId().then((nextId) => {
        reqbody.id = nextId;        
        var collection = mongoDataBase.collection(collectionName);
        collection.insert(reqbody, function(err, result) {
            assert.equal(err, null);
            res.status(201).send({
                data: reqbody
            });
        });
    });   
});

// delete member
app.route(basePath + '/:id').delete((req, res) => {
    const id = parseInt(req.params['id'], 10);
    var collection = mongoDataBase.collection(collectionName);
    collection.deleteOne({ id: id }, (err, result) => {
        assert.equal(err, null);
        res.send({
            data: {}
        });
    });    
});

function reset() {
    console.log('Database Reset');
    var collection = mongoDataBase.collection(collectionName);
    collection.deleteMany({}, (err, result) => {
        assert.equal(err, null);
        addTeamMember(collection, 0);
    });
}

function addTeamMember(collection, currentIndex) {
    if(currentIndex >= teamMembers.length) {
        console.log('Reset Finished')
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
