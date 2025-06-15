import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (to, body) => {
  try {
    await client.messages.create({
      body,
      from: 'whatsapp:' + process.env.TWILIO_PHONE,  // WhatsApp sandbox number
      to: 'whatsapp:+91' + to,                       // User's number
    });
    console.log("📱 WhatsApp message sent to", to);
  } catch (error) {
    console.error("❌ SMS error:", error.message || error);
  }
};

export default sendSMS;
