const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT) // Apply verifyJWT middleware to all the routes inside this file

router.route('/')
      .get(usersController.getAllUsers)
      .post(usersController.createNewUser)
      .patch(usersController.updateUser)
      .delete(usersController.deleteUser)

module.exports = router