require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI).then(seed).then(() => console.log('DB connected')).catch(console.error);

const Service = mongoose.model('Service', new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['men', 'women', 'unisex'], default: 'unisex' },
  price: Number,
  minutes: Number
}));

const Booking = mongoose.model('Booking', new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: String, required: true },  // YYYY-MM-DD
  time: { type: String, required: true },  // HH:MM
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true }));

async function seed() {
  if (await Service.countDocuments()) return;
  await Service.insertMany([
    { name: 'Haircut', category: 'unisex', price: 300, minutes: 30 },
    { name: "Men's Beard Trim", category: 'men', price: 150, minutes: 20 },
    { name: 'Facial', category: 'unisex', price: 800, minutes: 45 },
    { name: 'Hair Spa', category: 'women', price: 1200, minutes: 60 },
    { name: 'Manicure', category: 'unisex', price: 500, minutes: 40 }
  ]);
}

const admin = (req, res, next) =>
  req.headers['x-admin-key'] === process.env.ADMIN_KEY ? next() : res.status(401).json({ error: 'Unauthorized' });

const wrap = fn => (req, res) => fn(req, res).catch(e => res.status(400).json({ error: e.message }));

// ---- Public ----
app.get('/api/services', wrap(async (req, res) => res.json(await Service.find().sort('category name'))));

app.post('/api/bookings', wrap(async (req, res) => {
  const { name, phone, service, date, time } = req.body;
  if (await Booking.findOne({ date, time, status: { $ne: 'cancelled' } }))
    return res.status(409).json({ error: 'That slot is already booked. Pick another time.' });
  const b = await Booking.create({ name, phone, service, date, time });
  res.status(201).json({ message: 'Booking received!', id: b._id });
}));

// ---- Admin ----
app.get('/api/bookings', admin, wrap(async (req, res) =>
  res.json(await Booking.find().populate('service').sort('-date -time'))));

app.patch('/api/bookings/:id', admin, wrap(async (req, res) =>
  res.json(await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }))));

app.delete('/api/bookings/:id', admin, wrap(async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id); res.json({ ok: true });
}));

app.post('/api/services', admin, wrap(async (req, res) => res.status(201).json(await Service.create(req.body))));

app.delete('/api/services/:id', admin, wrap(async (req, res) => {
  await Service.findByIdAndDelete(req.params.id); res.json({ ok: true });
}));

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
