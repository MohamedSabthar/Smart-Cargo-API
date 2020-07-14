const transporter = require('./mail-configuration').transporter;
const webAppLink = require('./mail-configuration').webAppLink;
const setPassword =  require('./set-password-template');

//this function require user(recipeint) object and a token
//token used to verify the user authenticy while resetting the password
module.exports = (recipient,token) => {
  console.log(recipient.contact.email)
    const mailOptions = {
        from: 'SmartCargo',
        to: recipient.contact.email,
        subject: 'We have registered your account!',
        html: setPassword(`${recipient.name.first} ${recipient.name.last}`,`${webAppLink}/reset-password/${token}`,recipient.role)
      };

      transporter.sendMail(mailOptions, (error, info)=> {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
