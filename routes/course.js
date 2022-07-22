const express = require('express');
const router = express.Router();
const Course = require('../models').Course;
const User = require('../models').User;
const { authenticateUser } = require('../middleware/auth-user');

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

// Route that returns a list of courses with the userId model for each course
router.get('/courses', asyncHandler( async(req, res) => {
    const courses = await Course.findAll({
        include: [
            {
              model: User,
              as: 'user',
            },
        ],
    });
    res.status(200).json(courses);
}));

// GET request by id /courses/:id with the userId model
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
        include: [
            {
              model: User,
              as: 'user',
            },
        ],
    })
    if(course) {
        res.status(200).json(course);
    } else {
        res.status(404).json({message: "Course not found"})
    };
}));

/* POST create a course. */
router.post('/courses', authenticateUser, asyncHandler( async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).location('/courses/' + course.id ).end();
      } catch (error) {
        if (error.name === 'SequelizeValidationError') {
          const errors = error.errors.map(err => err.message);
          res.status(400).json({ errors });   
        } else {
          throw error;
        }
      }
    
}));

// PUT request to /courses/:id to UPDATE(edit) a course
router.put('/courses/:id', authenticateUser, asyncHandler(async(req, res) => {
    try {
        const course = await Course.findByPk(req.params.id)
        await course.update(req.body);
        res.status(204).end();
      } catch (error) {
        if (error.name === 'SequelizeValidationError') {
          const errors = error.errors.map(err => err.message);
          res.status(400).json({ errors });   
        } else {
          throw error;
        }
      }

}));

/* Delete individual courses. */
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req ,res) => {
    const course = await Course.findByPk(req.params.id);
    if(course) {
      await course.destroy();
      res.status(204).end();
    } else {
        res.status(404).json({message: "Course not found"})
    }
    
}));



module.exports = router;