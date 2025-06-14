// server/services/twilioService.js

import twilio from "twilio";

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;

const client = twilio(accountSid, authToken);

export const sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: twilioPhone,
      to: to.startsWith('+') ? to : `+91${to}`, // Defaulting to India code if not present
    });
    console.log("SMS sent to", to);
  } catch (err) {
    console.error("Failed to send SMS:", err.message);
  }
};
