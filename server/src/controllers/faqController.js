import nodemailer from 'nodemailer';
import Faq from '../models/Faq.js';

const sendFAQ = async (req, res) => {
  const { question, email } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  try {
  // Save to Firestore
    await Faq.saveFAQ({ question, email });

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
      subject: 'New FAQ Submission',
      text: `Question: ${question}\nEmail: ${email || 'N/A'}`,
    });

    res.status(200).json({ message: 'FAQ sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send FAQ.' });
  }
};

export { sendFAQ };
