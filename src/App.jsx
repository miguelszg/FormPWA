import React, { useState } from 'react';
import { Brain, Smartphone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TechDependencyApp() {
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const questions = [
    { id: 'q1', text: '¿Usas tu celular antes de dormir?', key: 'usoCelularAntesDormir' },
    { id: 'q2', text: '¿Te cuesta pasar un día sin redes sociales?', key: 'dificultadSinRedes' },
    { id: 'q3', text: '¿Usas el celular mientras comes?', key: 'celularMientrasComida' },
    { id: 'q4', text: '¿Te distrae el celular en el trabajo o estudio?', key: 'distraeCelularTrabajo' }
  ];

  // Red neuronal simple con pesos ajustados
  const simpleNeuralNetwork = (inputs) => {
    // Pesos para cada pregunta (ajustados para dar más importancia a ciertas preguntas)
    const weights = [0.3, 0.4, 0.2, 0.1];
    const bias = -0.5;
    
    // Calcular suma ponderada
    let sum = bias;
    inputs.forEach((input, index) => {
      sum += input * weights[index];
    });
    
    // Función de activación (sigmoid)
    const sigmoid = 1 / (1 + Math.exp(-sum));
    
    return sigmoid;
  };

  const handleResponse = async (answer) => {
    const currentQ = questions[currentQuestion];
    const newResponses = { ...responses, [currentQ.key]: answer };
    setResponses(newResponses);

    // Si la primera pregunta es NO, terminar el cuestionario SIN GUARDAR
    if (currentQuestion === 0 && !answer) {
      setIsCompleted(true);
      setPrediction({
        level: 'bajo',
        score: 0,
        message: 'No presentas signos de dependencia tecnológica. ¡Excelente!'
      });
      // NO se guarda en la base de datos
      return;
    }

    // Si no es la última pregunta, continuar
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Procesar con red neuronal
      const inputArray = questions.map(q => newResponses[q.key] ? 1 : 0);
      const score = simpleNeuralNetwork(inputArray);
      
      let level = 'bajo';
      let message = 'Tienes un nivel bajo de dependencia tecnológica.';
      
      if (score > 0.7) {
        level = 'alto';
        message = 'Tienes un nivel alto de dependencia tecnológica. Considera reducir el uso.';
      } else if (score > 0.4) {
        level = 'medio';
        message = 'Tienes un nivel medio de dependencia tecnológica. Mantén el equilibrio.';
      }
      
      setPrediction({ level, score: score.toFixed(2), message });
      setIsCompleted(true);
      
      await saveToDatabase(newResponses, level, score);
    }
  };

  const saveToDatabase = async (data, level, score) => {
    setLoading(true);
    try {
      // Aquí va la llamada real a tu API de MongoDB
      const response =await fetch('https://form-back-neon.vercel.app/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: data,
          prediction: level,
          score: parseFloat(score),
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar');
      }
      
      console.log('Datos guardados exitosamente');
    } catch (error) {
      console.error('Error al guardar en la base de datos:', error);
      // En desarrollo, simular guardado exitoso
      console.log('Datos que se guardarían:', { data, level, score });
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setResponses({});
    setCurrentQuestion(0);
    setIsCompleted(false);
    setPrediction(null);
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
              prediction.level === 'alto' ? 'bg-red-100' : 
              prediction.level === 'medio' ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              {prediction.level === 'alto' ? <AlertCircle className="w-10 h-10 text-red-600" /> :
               prediction.level === 'medio' ? <Brain className="w-10 h-10 text-yellow-600" /> :
               <CheckCircle className="w-10 h-10 text-green-600" />}
            </div>
            
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Resultados
            </h2>
            
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Nivel de Dependencia: 
                <span className={`ml-2 ${
                  prediction.level === 'alto' ? 'text-red-600' : 
                  prediction.level === 'medio' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {prediction.level.toUpperCase()}
                </span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Puntuación: {(prediction.score * 100).toFixed(0)}%
              </p>
              <p className="text-gray-700 leading-relaxed">
                {prediction.message}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Tus respuestas:</h3>
              <div className="space-y-2 text-sm">
                {questions.map(q => (
                  <div key={q.id} className="flex justify-between items-center">
                    <span className="text-gray-600">{q.text}</span>
                    {responses[q.key] ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> : 
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                  </div>
                ))}
              </div>
            </div>

            {loading && <p className="text-blue-600 mb-4">Guardando datos...</p>}

            <button
              onClick={resetQuiz}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Realizar nuevo cuestionario
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <Smartphone className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Test de Dependencia Tecnológica
          </h1>
          <p className="text-gray-600">
            Responde con honestidad para conocer tu nivel
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Pregunta {currentQuestion + 1} de {questions.length}</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            {questions[currentQuestion].text}
          </h2>

          <div className="space-y-4">
            <button
              onClick={() => handleResponse(true)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-6 h-6" />
              Sí
            </button>
            
            <button
              onClick={() => handleResponse(false)}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <XCircle className="w-6 h-6" />
              No
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <Brain className="w-5 h-5 inline mr-1" />
          Análisis con Red Neuronal Simple
        </div>
      </div>
    </div>
  );
}