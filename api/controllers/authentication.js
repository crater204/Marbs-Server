const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

// WIP in save function:
// Error traps
// Form input validation
// Error catching

module.exports.register = (req, res) => {
  let user = new User();

  user.name = req.body.name;
  user.email = req.body.email;

  user.setPassword(req.body.password);

  user.save(err => {
    let token;
    token = user.generateJwt();
    res.status(200);
    res.json({
      "token": token
    });
  });
};

module.exports.login = (req, res) => {
  passport.authenticate('local', (err, user, info) => {
    let token;
    if (err) {
      res.status(404).json(err);
      return;
    }
    if (user) {
      token = user.generateJwt();
      res.status(200);
      res.json({
        "token": token
      });
    } else {
      res.status(401).json(info);
    }
  })(req, res);
};
