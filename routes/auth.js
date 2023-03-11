const express = require('express');
const router = express.Router();

const ExpressError = require("../expressError");
const User = require("../models/user");
const jwt = require('jsonwebtoken');
const {SECRET_KEY} = require('../config')



router.post('/login', async (req, res, next) => {
/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
    try {
        const {username, password} = req.body;
        if (await User.authenticate(username, password)) {
            User.updateLoginTimestamp(username);
            return res.send({token:jwt.sign({username}, SECRET_KEY)})
        } else {
            return res.status(400).json({"error":"failed to authenticate"})
        }
    } catch(e) {
        return next(e);
    }
})


router.post('/register', async (req, res, next) => {
    /** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
    try {
        // const {username, password, first_name, last_name, phone} = req.body;
        const newUser = await User.register(req.body);
        if (!newUser) {
            return new ExpressError("Error creating new user", 400);
        } else {
            const newUserToken = await jwt.sign({username:newUser.username}, SECRET_KEY);
            return res.send({token:newUserToken});
        }

    } catch(e) {
        next(e);
    }
})

module.exports = router;