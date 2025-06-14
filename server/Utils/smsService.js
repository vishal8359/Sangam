import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (to, body) => {
  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE,
      to: `+91${to}`, // or just use `to` if it's already in international format
    });
    console.log("📱 SMS sent to", to);
  } catch (error) {
    console.error("❌ SMS error:", error);
  }
};

export default sendSMS;
