const jwt = require('express-jwt');
const auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload' // <-- should be exported to an environment var in home server
});

router.get('/profile', auth, ctrlProfile.profileRead);

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message": `${err.name}: ${err.message}`});
  }
});
