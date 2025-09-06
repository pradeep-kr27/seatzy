const nodemailer = require("nodemailer");
const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

const { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL } = process.env;

function replaceContent(content, creds) {
  // creds = {name:"John", otp:1234}
  const allKeys = Object.keys(creds);
  allKeys.forEach(function (key) {
    content = content.replace(`#{${key}}`, creds[key]);
  });
  return content;
}

async function EmailHelper(templateName, receiverEmail, creds, emailType = 'otp') {
  try {
    const templatePath = path.join(__dirname, "email_templates", templateName);
    const content = await fs.promises.readFile(templatePath, "utf-8");
    
    // Set subject and text based on email type
    let subject, text;
    if (emailType === 'booking_confirmation') {
      subject = "🎬 Booking Confirmed - Seatzy";
      text = `Hi ${creds.userName}, Your booking for ${creds.movieName} has been confirmed. Transaction ID: ${creds.transactionId}`;
    } else {
      subject = "Mail from ScalerShows";
      text = `Hi ${creds.name}, Your OTP is ${creds.otp}`;
    }
    
    const emailDetails = {
      to: receiverEmail,
      from:  SENDGRID_FROM_EMAIL,
      subject: subject,
      text: text,
      html: replaceContent(content, creds),
    };
    const transportDetails = {
      host: "smtp.sendgrid.net",
      port: 587,
      // service: 'gmail',
      auth: {
        user: "apikey",
        pass: SENDGRID_API_KEY,
      },
    };

    const transporter = nodemailer.createTransport(transportDetails);
    await transporter.sendMail(emailDetails);
    console.log("Email sent successfully");
  } catch (err) {
    console.log(err);
  }
}

module.exports = EmailHelper;
