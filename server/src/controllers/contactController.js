import nodemailer from 'nodemailer';
import Contact from '../models/Contact.js';

const sendContact = async (req, res) => {
  const { firstName, lastName, email, message } = req.body;
  if (!firstName || !email || !message) {
    return res.status(400).json({ error: 'First name, email, and message are required.' });
  }

  const fullName = lastName ? `${firstName} ${lastName}` : firstName;

  try {
  // Save to Firestore
    await Contact.saveContact({ firstName, lastName, email, message, fullName });

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
      subject: 'New Contact Form Submission',
      text: `Name: ${fullName}\nEmail: ${email}\nMessage: ${message}`,
    });

    res.status(200).json({ message: 'Contact form sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send contact form.' });
  }
};

export { sendContact };
