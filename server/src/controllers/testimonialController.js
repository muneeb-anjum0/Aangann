import nodemailer from 'nodemailer';
import Testimonial from '../models/Testimonial.js';


const sendTestimonial = async (req, res) => {
  const { name, city, rating, text } = req.body;
  if (!name || !city || !text || !rating) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
  // Save to Firestore
    await Testimonial.saveTestimonial({ name, city, rating, text });

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
      subject: 'New Testimonial Submission',
      text: `Name: ${name}\nCity: ${city}\nRating: ${rating}\nText: ${text}`,
    });

    res.status(200).json({ message: 'Testimonial sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send testimonial.' });
  }
};

export { sendTestimonial };
