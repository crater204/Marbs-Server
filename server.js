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
    { id: 11, name: 'Derek Bodi', marblesEarned: 6, datesTakenOff: [
      '2017-03-16' , '2017-02-13', '2018-01-03', '2017-07-03', '2017-12-23'
    ] },
    { id: 12, name: 'Nick Angelo', marblesEarned: 5, datesTakenOff: [
      '2017-03-16' , '2017-02-13', '2018-01-03', '2017-07-03', '2017-12-23'
    ] },
    { id: 13, name: 'Rachael Jenkins', marblesEarned: 4, datesTakenOff: [
      '2017-03-16' , '2017-02-13', '2018-01-03', '2017-07-03', '2017-12-23'
    ] },
    { id: 14, name: 'Sebastian Salomone', marblesEarned: 3, datesTakenOff: [
      '2017-03-16' , '2017-02-13', '2018-01-03', '2017-07-03', '2017-12-23'
    ] },
    { id: 15, name: 'Zach McGuire', marblesEarned: 2, datesTakenOff: [
      '2017-03-16' , '2017-02-13', '2018-01-03', '2017-07-03', '2017-12-23'
    ] }
  ];

app.use(cors());
app.use(bodyParser.json());

MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log('Connected to Mongo');
    mongoDataBase = db;
});

app.listen(port, ()=> {
    console.log('Server Started');
});

function getNextId() {
    return new Promise(
        (resolve, reject) => {
            const collection = mongoDataBase.collection(nextIdCollection);
            collection.find({}).toArray((err, data) => {
                let nextId = data[0].nextId;
                collection.update({}, { nextId: nextId + 1 }, (err, data) => {
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
    console.log(id);
    const collection = mongoDataBase.collection(collectionName);
    collection.find( { id: id } ).toArray((err, members) => {
        assert.equal(err, null);
        res.send({
            data: members[0]
        }); 
    })
});

// Edit member
app.route(basePath).put((req, res) => {
    let reqbody = req.body;
    let id = parseInt(reqbody.id, 10);

    const collection = mongoDataBase.collection(collectionName);
    collection.update({ id : id},  reqbody, (err, result) => {
        console.log(err);
        assert.equal(err, null);
        res.send({
            data: reqbody
        });
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
    let removedUsers;
    teamMembers = teamMembers.filter((member) => {
        if (member.id == req.params['id']) {
            removedUsers = member;
        }
        return member.id != req.params['id'];
    });
    res.send({
        data: removedUsers
    });
});

// the list of members whose name contains the substring 'name'
// TODO: Make sure that the path gets updated in client service 
app.route(basePath + '/search/:name').get((req, res) => {
    let name = req.params['name'];

    const filteredMembers = teamMembers.filter( (member) => {
        return member.name.toUpperCase().includes(name.toUpperCase());
    });

    res.send({
        data: filteredMembers
    })
});