const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port : 587,
    secure : false , // true for 465 port
    auth: {
      user: 'third.year.group.project.2020@gmail.com',
      pass: 'A+everyone'
    }
  });

const webAppLink  = process.env.WEB_APP_DOMAIN || "http://localhost:4200";

module.exports = {transporter,webAppLink};