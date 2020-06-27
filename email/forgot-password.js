const nodemailer = require('nodemailer');
const forgotPassword =  require('./password-reset-template');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port : 587,
  secure : false , // true for 465 port
  auth: {
    user: 'third.year.group.project.2020@gmail.com',
    pass: 'A+everyone'
  }
});

const webAppLink  = process.env.WEB_APP_DOMAIN || "http://localhost:4200/reset-password";

//this function require user(recipeint) object and a token
//token used to verify the user authenticy while resetting the password
module.exports = (recipient,token) => {
  console.log(recipient.contact.email)
    const mailOptions = {
        from: 'SmartCargo',
        to: recipient.contact.email,
        subject: 'SmartCargo forgot your password!',
        html: forgotPassword(`${recipient.name.first} ${recipient.name.last}`,`${webAppLink}/${token}`)
      };

      transporter.sendMail(mailOptions, (error, info)=> {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
