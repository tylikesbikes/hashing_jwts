const router = require('express').Router();
const db = require('../db');
const Message = require('../models/message');
const {ensureLoggedIn, ensureCorrectUser} = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const SECRET_KEY = require('../config');
const ExpressError = require('../expressError');
const {sendTestMessage} = require('./twilio');
const User = require('../models/user');

router.get('/:id', ensureLoggedIn, async (req, res, next) => {
/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
    try {
        const loggedInUser = req.user.username;
        console.log(loggedInUser);
        const result = await Message.get(req.params.id);
        if (loggedInUser === result.from_user.username || loggedInUser=== result.to_user.username) {
            return res.json({message:result})
        } else {
            throw new ExpressError("Must be logged in as sender or recipient to view this message", 400)
        }
    } catch(e) {
        next(e);
    }
})


router.post('/', ensureLoggedIn, async (req, res, next) => {
/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
    try {
        const newMessage = await Message.create({from_username:req.user.username, to_username:req.body.to_username, body:req.body.body})
        const recipient = await User.get(req.body.to_username);
        const recipPhone = recipient.user.phone;
        
        sendTestMessage(req.body.body, recipPhone)
        return res.json({message:newMessage});
    } catch(e) {
        next(e);
    }
})


router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
    try {
        const message = await Message.get(req.params.id);
        if (req.user.username === message.to_user.username) {
        const readMessage = await Message.markRead(req.params.id);
        return res.json({message:readMessage});
        } else {
            throw new ExpressError("Incorrect user", 400)
        }
    } catch(e) {
        next(e);
    }
})


module.exports = router;