const fetch = require('node-fetch'); // Ensure node-fetch is available if Node < 18, or native fetch in Node 18+

const triagePatient = async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms) {
      return res.status(400).json({ message: 'Symptoms are required' });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(500).json({ message: 'Groq API Key is not configured' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { 
            role: 'system', 
            content: 'You are HealthConnect AI, a medical triage assistant. Analyze the user\'s symptoms and provide a brief, professional assessment. Suggest whether they should see a doctor, rest at home, or seek emergency care immediately. Do not provide a definitive diagnosis.' 
          },
          { 
            role: 'user', 
            content: symptoms 
          }
        ],
        temperature: 0.5,
        max_tokens: 300
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error(data.error);
      return res.status(500).json({ message: 'Error from Groq API' });
    }

    const reply = data.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during AI triage' });
  }
};

module.exports = {
  triagePatient
};
