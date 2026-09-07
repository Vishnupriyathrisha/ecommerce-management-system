const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, otp) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/otpEmail.ejs"
    );

    const html = await ejs.renderFile(
      templatePath,
      {
        otp: otp,
        expiryTime: 5,
      }
    );

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully");
    console.log(info.messageId);

  } catch (error) {
    console.log("Email error:", error);
  }
};

module.exports = sendEmail;