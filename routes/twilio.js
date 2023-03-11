const express = require('express');
const {TWILIO_ACCT_SID, TWILIO_AUTH_TOKEN, TWILIO_ACCT_PHONE_NUMBER} = require('../config')
const client = require('twilio')(TWILIO_ACCT_SID, TWILIO_AUTH_TOKEN);


function sendTestMessage(msgBody, toNumber) {
client.messages
    .create({body:msgBody, from:TWILIO_ACCT_PHONE_NUMBER, to:toNumber}).then(message => console.log(message.sid));
    return 0;
}

module.exports = {sendTestMessage};