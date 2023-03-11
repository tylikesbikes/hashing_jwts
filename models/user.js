/** User class for message.ly */

const { DB_URI, BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const db = require('../db.js');
const bcrypt = require('bcrypt');
const ExpressError = require("../expressError");



/** User of the site. */

class User {



  static async register(body) {
      /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */
    const {username, password, first_name, last_name, phone} = body;
    const pwHash = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const now = new Date().toISOString();
    const newUser = await db.query(`INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING username, password, first_name, last_name, phone`, [username, pwHash, first_name, last_name, phone, now, now]);
    return newUser.rows[0];
   }

  

  static async authenticate(username, password) {
    /** Authenticate: is this username/password valid? Returns boolean. */
    const results = await db.query(`SELECT password FROM users WHERE username=$1`,[username]);
    if (results.rows.length === 0) {
      throw new ExpressError("Username not found", 400)
    }
    const userPw = results.rows[0].password;

    return await bcrypt.compare(password, userPw)

    // if (await bcrypt.compare(password, userPw)) {
    //   return true;
    // }
    // return false;
  }

  

  static async updateLoginTimestamp(username) {
    /** Update last_login_at for user */
    const results = await db.query(`UPDATE users SET last_login_at = $1 WHERE username = $2 returning username, last_login_at`, [new Date().toISOString(), username]);
    if (results.rows.length === 0) {
      throw new ExpressError("Failed to update last_login_at for user", 400);
    }
   }



  static async all() {
      /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */
    const results = await db.query(`SELECT username, first_name, last_name, phone FROM users`);
    return results.rows;
   }


  static async get(username) {
      /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */
    const results = await db.query(`SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users WHERE username = $1`, [username]);
      if (results.rows.length === 0) {
        throw new ExpressError("Username not found", 404);
      }
      return results.rows[0];
   }


  static async messagesFrom(username) {
      /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */
      const messages = await db.query(`
      SELECT m.id,
      m.body,
      m.sent_at,
      m.read_at,
      tu.first_name,
      tu.last_name,
      tu.phone,
      tu.username
      FROM messages m
      LEFT JOIN users tu 
      on m.to_username = tu.username
      WHERE m.from_username = $1
      `, [username])

      let msgs=[];

      for (let msg of messages.rows) {
        msgs.push({
          id:msg.id, 
          body:msg.body, 
          sent_at:msg.sent_at,
          read_at:msg.read_at, 
          to_user:{
            username:msg.username, 
            first_name:msg.first_name, 
            last_name:msg.last_name , 
            phone:msg.phone
          }
          })
      }
      


      if (messages.rows.length === 0) {
        throw new ExpressError("Username not found", 404);
      }
      // messages.rows.to_user = user.rows[0];

      return msgs;
   }



  static async messagesTo(username) {
      /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */
      const messages = await db.query(`
      SELECT m.id,
      m.body,
      m.sent_at,
      m.read_at,
      tu.first_name,
      tu.last_name,
      tu.phone,
      tu.username
      FROM messages m
      LEFT JOIN users tu 
      on m.from_username = tu.username
      WHERE m.to_username= $1
      `, [username])

      let msgs=[];

      for (let msg of messages.rows) {
        msgs.push({
          id:msg.id, 
          body:msg.body, 
          sent_at:msg.sent_at,
          read_at:msg.read_at, 
          from_user:{
            username:msg.username, 
            first_name:msg.first_name, 
            last_name:msg.last_name , 
            phone:msg.phone
          }
          })
      }
      


      if (messages.rows.length === 0) {
        throw new ExpressError("Username not found", 404);
      }
      // messages.rows.to_user = user.rows[0];

      return msgs;
   }
}


module.exports = User;