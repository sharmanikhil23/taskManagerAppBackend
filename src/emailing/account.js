const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.KEY);

const creatingNewUser = (email, name) => {
  sgMail.send({
    to: email, // Change to your recipient
    from: "nikhil23062000@icloud.com", // Change to your verified sender
    subject: "Welcome Email",
    text: `Hii! ${name}, Your account is ready to use`,
  });
};

const removingUser = (email, name) => {
  sgMail.send({
    to: email, // Change to your recipient
    from: "nikhil23062000@icloud.com", // Change to your verified sender
    subject: "Account Removed",
    text: `Hii! ${name}, Sorry you are leaving us`,
  });
};

module.exports = { creatingNewUser, removingUser };
