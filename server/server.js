// server.js (versión ESM)
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Schema para almacenar las respuestas
const ResponseSchema = new mongoose.Schema({
  usoCelularAntesDormir: { type: Boolean, required: true },
  dificultadSinRedes: { type: Boolean, required: true },
  celularMientrasComida: { type: Boolean, required: true },
  distraeCelularTrabajo: { type: Boolean, required: true },
  prediction: String,
  score: Number,
  timestamp: { type: Date, default: Date.now }
});

const Response = mongoose.model('Response', ResponseSchema);

// Endpoint para guardar respuestas
app.post('/api/responses', async (req, res) => {
  try {
    const { responses } = req.body;
    
    if (!responses) {
      return res.status(400).json({ 
        error: 'El campo "responses" es requerido en el body' 
      });
    }
    
    const newResponse = new Response({
      usoCelularAntesDormir: responses.usoCelularAntesDormir,
      dificultadSinRedes: responses.dificultadSinRedes,
      celularMientrasComida: responses.celularMientrasComida,
      distraeCelularTrabajo: responses.distraeCelularTrabajo,
      prediction: req.body.prediction || null,
      score: req.body.score || null,
      timestamp: new Date()
    });
    
    await newResponse.save();
    res.status(201).json({ 
      message: 'Guardado exitosamente',
      data: newResponse 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener todas las respuestas
app.get('/api/responses', async (req, res) => {
  try {
    const responses = await Response.find().sort({ timestamp: -1 });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para exportar en formato JSON para tu neurona
app.get('/api/export/neurona', async (req, res) => {
  try {
    const responses = await Response.find().select('-_id -__v -prediction -score -timestamp');
    
    const neuronData = {
      respuestas: responses.map(r => ({
        usoCelularAntesDormir: r.usoCelularAntesDormir,
        dificultadSinRedes: r.dificultadSinRedes,
        celularMientrasComida: r.celularMientrasComida,
        distraeCelularTrabajo: r.distraeCelularTrabajo
      }))
    };
    
    res.json(neuronData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose.connect('mongodb+srv://2021337062:Lmw1TAMrvgwA9kxD@formspwa.wu2pi7s.mongodb.net/?retryWrites=true&w=majority&appName=FormsPWA');

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));