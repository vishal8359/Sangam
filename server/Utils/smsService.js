import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (to, body) => {
  console.log("SID:", process.env.TWILIO_SID);
  console.log("AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN);
  console.log("PHONE:", process.env.TWILIO_PHONE);

  try {
    await client.messages.create({
      body,
      from: "whatsapp:" + process.env.TWILIO_PHONE,
      to: "whatsapp:+91" + to,
    });
    console.log("📱 WhatsApp message sent to", to);
  } catch (error) {
    console.error("❌ SMS error:", error.message || error);
  }
};

export default sendSMS;
