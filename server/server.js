// server.js (versión ESM)
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const ResponseSchema = new mongoose.Schema({
  usoCelularAntesDormir: Boolean,
  dificultadSinRedes: Boolean,
  celularMientrasComida: Boolean,
  distraeCelularTrabajo: Boolean,
  prediction: String,
  score: Number,
  timestamp: Date
});

const Response = mongoose.model('Response', ResponseSchema);

app.post('/api/responses', async (req, res) => {
  try {
    const newResponse = new Response(req.body);
    await newResponse.save();
    res.status(201).json({ message: 'Guardado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose.connect('mongodb+srv://2021337062:Lmw1TAMrvgwA9kxD@formspwa.wu2pi7s.mongodb.net/?retryWrites=true&w=majority&appName=FormsPWA');
app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));
