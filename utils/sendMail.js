const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

let transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  })
);

exports.sendVerifyEmail = (verifyUrl, email) => {
  const mailOptions = {
    from: process.env.GMAIL_ACCOUNT,
    to: email,
    subject: "Account verfication",
    html: `Verify your email your email account by clicking here <a href="${verifyUrl}">${verifyUrl}</a>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
