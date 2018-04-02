const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 9876;
const basePath = '/api/teamMembers';

let nextId = 16;
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

app.listen(port, ()=> {
    console.log('Server Started');
});

// get members
app.route(basePath).get((req, res) => {
    res.send({
        'members': teamMembers 
    });
});

// get member by id
app.route(basePath + '/:id').get((req, res) => {
    const id = req.params['id'];
    const filteredMembers = teamMembers.filter( (member) => {
        return id == member.id;
    });
    res.send({
        'member': filteredMembers[0]
    });   
});

// Edit member
app.route(basePath).put((req, res) => {
    let reqbody = req.body;
    let id = reqbody.id;
    reqbody.id = id;
    for ( var i in teamMembers) {
        if (teamMembers[i].id == id) {
            teamMembers[i] = reqbody;
            break;
        }
    }
    res.send({
        member: reqbody
    });
});

// add member
app.route(basePath).post((req, res) => {
    let reqbody = req.body;
    reqbody.id = nextId;
    teamMembers[teamMembers.length] = reqbody;
    nextId++;

    res.status(201).send({
        member: reqbody
    });
});

// delete user
app.route(basePath + '/:id').delete((req, res) => {
    // deletes the team member with the specified id
    teamMembers = teamMembers.filter((member) => {
        return member.id != req.params['id'];
    });

    res.sendStatus(204);
});

// TODO: Make sure that the path gets updated in client service 
app.route(basePath + '/search/:name').get((req, res) => {
    // the list of users whose name contains the substring 'name'
});