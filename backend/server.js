const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const ORDERS_FILE = path.join(__dirname, 'orders.json');

function saveOrder(order) {
  let list = [];
  if (fs.existsSync(ORDERS_FILE)) {
    try { list = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8') || '[]'); } catch(e){ list = []; }
  }
  list.push(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(list,null,2));
}

// Basic health route
app.get('/', (req, res) => res.send('Inherb backend running'));

// Receive orders from frontend
app.post('/api/order', async (req, res) => {
  try {
    const order = req.body;
    order.receivedAt = new Date().toISOString();
    saveOrder(order);

    // Send notification email if SMTP configured
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = process.env.SMTP_PORT || 587;
    const notifyTo = process.env.NOTIFY_EMAIL;
    if (smtpUser && smtpPass && notifyTo) {
      try {
        let transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort == 465,
          auth: { user: smtpUser, pass: smtpPass }
        });
        const subject = `New order from ${order.name || 'Unknown'}`;
        const body = `Product: ${order.product}\nQuantity: ${order.quantity}\nName: ${order.name}\nPhone: ${order.phone}\nAddress: ${order.address}\nTime: ${order.receivedAt}`;
        await transporter.sendMail({ from: smtpUser, to: notifyTo, subject, text: body });
      } catch (e) {
        console.error('Email send failed:', e);
      }
    }

    res.json({ ok: true, message: 'Order saved' });
  } catch (e) {
    console.error(e);
    res.status(500).send('Unable to save order');
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server running on port', PORT));
