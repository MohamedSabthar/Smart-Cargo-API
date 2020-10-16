const nodemailer = require('nodemailer');
const mail = process.env.MAIL
const password = process.env.PASS
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port : 587,
    secure : false , // true for 465 port
    auth: {
      user: mail,
      pass: password
    }
  });

const webAppLink  = process.env.WEB_APP_DOMAIN || "http://localhost:4200";

module.exports = {transporter,webAppLink};