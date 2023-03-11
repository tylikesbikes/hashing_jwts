const express = require('express');
const router = express.Router();
const db = require('../db');
const User = require('../models/user');
const {ensureLoggedIn, ensureCorrectUser} = require('../middleware/auth');

router.get('/', ensureLoggedIn, async (req, res, next) => {
    /** GET / - get list of users.
    *
    * => {users: [{username, first_name, last_name, phone}, ...]}
    *
    **/
   const results = await db.query(`SELECT username, first_name, last_name, phone FROM users`);

   return res.json({users:results.rows})
})


router.get('/:username', ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
    try {
        const userInfo = await User.get(req.params.username);
        return res.json({userInfo})
    } catch(e) {
        next(e)
    }
})


router.get('/:username/to', ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 **/
    try {
        const messagesTo = await User.messagesTo(req.params.username);
        return res.json({messages:messagesTo});
    } catch(e) {
        next(e);
    }
})


router.get('/:username/from', ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
try {
    const messagesFrom = await User.messagesFrom(req.params.username);
    return res.json({messages:messagesFrom});
} catch(e) {
    next(e);
}
})


module.exports = router;