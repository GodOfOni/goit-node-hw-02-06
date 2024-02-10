const nodemailer = require("nodemailer");

const config = {
  host: "smtp.eu.sendgrid.net",
  port: 587,
  secure: true,
  auth: {
    user: process.env.SENDGRID_USERNAME,
    pass: process.env.SENDGRID_PASSWORD,
  },
};
const transporter = nodemailer.createTransport(config);

module.exports = transporter;
