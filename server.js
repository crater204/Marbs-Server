const express = require('express');
const app = express();
const port = 9876;
const basePath = '/api/teamMembers';

const teamMembers = [
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

app.listen(port, ()=> {
    console.log('Server Started');
});

app.route(basePath).get((req, res) => {
    // returns a list of team members
});

app.route(basePath + '/$id').get((req, res) => {
    // returns a specific team member with the specified ID
});

// TODO: Make sure that the path gets updated in client service
app.route(basePath + '/$id').put((req, res) => {
    // updates the specified team member
});

app.route(basePath).post((req, res) => {
    // adds the new team member to the array
});

app.route(basePath + '/$id').delete((req, res) => {
    // deletes the team member with the specified id
});

// TODO: Make sure that the path gets updated in client service 
app.route(basePath + '/search/$name').get((req, res) => {
    // the list of users whose name contains the substring 'name'
});