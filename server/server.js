// server/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();

// ----- CORS (same logic you had) -----
const allowed = ((process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',') || [])
  .map(s => (typeof s === 'string' ? s.trim() : ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl/postman/no-origin
    const ok = allowed.some(o => origin === o || origin.startsWith(o));
    return ok ? cb(null, true) : cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// handle bare OPTIONS quickly
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(bodyParser.json());

// ----- Mailer (unchanged) -----
const tx = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const MAIL_TO = process.env.TO_EMAIL;

async function send(subject, text) {
  return tx.sendMail({
    from: `"Aangan Site" <${process.env.SMTP_USER}>`,
    to: MAIL_TO,
    subject,
    text,
  });
}

// ----- Health -----
app.get('/health', (_req, res) => res.json({ ok: true }));

// ----- FAQ (unchanged) -----
app.post('/api/faq', async (req, res) => {
  try {
    const { question, email } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ ok: false, error: 'Question is required' });
    }
    const lines = [question.trim()];
    if (email && String(email).trim()) lines.push('', `From: ${String(email).trim()}`);

    await send('New FAQ Question', lines.join('\n'));
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'MAIL_FAIL' });
  }
});

// ----- Testimonials (unchanged) -----
app.post('/api/testimonials', async (req, res) => {
  try {
    const { name, city, rating, text } = req.body || {};
    if (!name || !city || !text) {
      return res.status(400).json({ ok: false, error: 'name, city, text required' });
    }
    const ratingStr = (rating ?? '').toString();

    const body = [
      `${name}`.trim(),
      `${city}`.trim(),
      `${ratingStr}`.trim(),
      '',
      `${text}`.trim(),
    ].join('\n');

    await send('New Testimonial', body);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'MAIL_FAIL' });
  }
});

// ===== NEW: Contact Us =====
app.post('/api/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body || {};
    if (!firstName || !email || !message) {
      return res.status(400).json({ ok: false, error: 'firstName, email, message required' });
    }
    const body = [
      `Name: ${`${firstName} ${lastName || ''}`.trim()}`,
      `Email: ${email}`,
      '',
      `${message}`.trim(),
    ].join('\n');

    await send('Contact form submission', body);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'MAIL_FAIL' });
  }
});

// ===== NEW: Waitlist =====
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ ok: false, error: 'email required' });

    const body = `New waitlist signup:\n\nEmail: ${email}`;
    await send('Waitlist signup', body);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'MAIL_FAIL' });
  }
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`Aangan server listening on http://localhost:${port}`));
