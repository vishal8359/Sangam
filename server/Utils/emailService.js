import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config(); 


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text }) => {

  if (!to) {
    console.error("❌ Cannot send email: 'to' field is missing or empty");
    return;
  }
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent to", to);
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};


export default sendEmail;
