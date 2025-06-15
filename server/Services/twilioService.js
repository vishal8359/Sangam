// server/Utils/smsService.js
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to, body) => {
  try {
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE}`, // WhatsApp sandbox number
      to:   `whatsapp:+91${to}`,                   // ensure +91 prefix
      body
    });
    console.log("📱 WhatsApp message sent to +91" + to);
  } catch (err) {
    console.error("❌ WhatsApp error:", err.message);
  }
};

export default sendSMS;
