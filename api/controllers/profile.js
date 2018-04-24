const mongoose = require('mongoose');
const User = mongoose.model('User');

// WIP:
// add error catching in case user isn't found

module.exports.profileRead = (req, res) => {
  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: private profile -- ask Chris :)"
    });
  } else {
    User
      .findById(req.payload._id)
      .exec((err, user) => {
        res.status(200).json(user);
      });
  }
};