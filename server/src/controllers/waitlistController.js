import nodemailer from 'nodemailer';
import Waitlist from '../models/Waitlist.js';

export const sendWaitlist = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
  // Save to Firestore
    await Waitlist.saveWaitlist({ email });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.TO_EMAIL,
      subject: 'New Waitlist Signup',
      text: `A new user joined the waitlist: ${email}`,
    });

    res.status(200).json({ message: 'Waitlist email sent successfully' });
  } catch (error) {
    console.error('Waitlist email error:', error);
    res.status(500).json({ message: 'Failed to send waitlist email', error: error.message, stack: error.stack });
  }
};
