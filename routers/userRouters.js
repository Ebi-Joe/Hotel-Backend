const userControllers = require('../controllers/userControllers');
const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router()

router.post("/api/signup", userControllers.signup)
router.post("/api/verify-email", userControllers.verifyEmail)
router.post("/api/login", userControllers.login)
router.get("/api/getOne-user", userControllers.getOneUser)
router.get("/api/getAll-users", auth, userControllers.getAllUser)
router.patch("/api/updateOne-user", userControllers.updateOneUser)
router.delete("/api/deleteOne-user", userControllers.deleteOneUser)
router.post("/api/forgetPassword", userControllers.forgetPassword)
router.post("/api/resetPassword", userControllers.resetPassword)
router.get('/api/me', auth, userControllers.getTheUser)

module.exports = router 