const express = require('express');
const router = express.Router();
const User = require('../models').User;
const { authenticateUser, currentUser } = require('../middleware/auth-user');

/* Handler function to wrap each route. */
function asyncHandler(cb){
    return async(req, res, next) => {
      try {
        await cb(req, res, next)
      } catch(error){
        // Forward error to the global error handler
        next(error);
      }
    }
}

// Route that returns a list of users.
router.get('/users', authenticateUser, asyncHandler(async(req, res) => {
  const user = req.currentUser; 
  await User.findAll();
  res.status(200).json(user);
    
}));


/* POST create an user. */
router.post('/users', asyncHandler(async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).location('/').json(user).end();
      } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
          const errors = error.errors.map(err => err.message);
          res.status(400).json({ errors });   
        } else {
          throw error;
        }
      }
    
}));

module.exports = router;