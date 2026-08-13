const fetch = require('node-fetch');

const triagePatient = async (req, res) => {
  try {
    const { symptoms, history } = req.body;
    
    if (!symptoms && (!history || history.length === 0)) {
      return res.status(400).json({ message: 'Symptoms or conversation history are required' });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(500).json({ message: 'Groq API Key is not configured' });
    }

    // System prompt instructing AI for Banglish support, medical triage, and prompt generation
    const systemMessage = {
      role: 'system',
      content: `You are HealthConnect AI, an intelligent, empathetic medical triage and healthcare assistant.
      
Key Rules:
1. Language & Script: You fluently understand Banglish (Bengali written in English/Roman script, e.g., "amar 2 din dhore khub matha batha r jor", "pet kharap, ki kora uchit?"), standard Bengali, and English.
   - Always reply in the exact language/script the user used. If the user writes in Banglish, reply in clear, natural, grammatically correct Banglish. If in English, reply in English.
2. Triage & Assessment:
   - Provide a professional, compassionate medical assessment of symptoms described.
   - Offer safe home care recommendations or suggest what kind of specialist doctor (e.g. Cardiologist, Neurologist, Medicine Specialist) they should consult.
   - Do NOT give a definitive final diagnosis, but explain likely causes.
   - If symptoms indicate a potential medical emergency (e.g., severe chest pain, extreme shortness of breath, loss of consciousness, uncontrolled bleeding, stroke signs), set severity to "critical" or "high" and advise calling emergency services (999) or visiting the nearest hospital immediately.
3. Output Format:
   - You MUST output ONLY valid JSON matching this schema:
     {
       "reply": "string (Your medical response in Banglish/English with markdown formatting)",
       "severity": "normal" | "high" | "critical",
       "suggestedPrompts": [
         "Short suggested quick prompt 1 in same language",
         "Short suggested quick prompt 2 in same language",
         "Short suggested quick prompt 3 in same language"
       ]
     }
4. Auto-Generated Prompts:
   - "suggestedPrompts" must contain 3 natural, relevant follow-up options for the user to tap quickly (e.g., "Kon doctor dekhabo?", "Home treatment tips ki?", "999 call korbo ki?").`
    };

    // Construct full conversation payload
    let messagesPayload = [systemMessage];

    if (Array.isArray(history) && history.length > 0) {
      // Include past turns for context (up to last 10 messages)
      const recentHistory = history.slice(-10).map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content || msg.text || ''
      }));
      messagesPayload = messagesPayload.concat(recentHistory);
    }

    if (symptoms) {
      const lastMsg = messagesPayload[messagesPayload.length - 1];
      if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== symptoms) {
        messagesPayload.push({
          role: 'user',
          content: symptoms
        });
      }
    }

    let response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messagesPayload,
        temperature: 0.5,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    });

    // Fallback to llama-3.1-8b-instant if 70b is busy or fails
    if (!response.ok) {
      console.warn('llama-3.3-70b-versatile failed, falling back to llama-3.1-8b-instant');
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: messagesPayload,
          temperature: 0.5,
          max_tokens: 500,
          response_format: { type: 'json_object' }
        })
      });
    }

    const data = await response.json();

    if (data.error) {
      console.error('Groq API Error:', data.error);
      return res.status(500).json({ message: 'Error from AI backend engine' });
    }

    const rawContent = data.choices[0].message.content;
    let parsedResult;

    try {
      parsedResult = JSON.parse(rawContent);
    } catch (parseErr) {
      console.error('JSON parsing failed for AI output:', parseErr);
      parsedResult = {
        reply: rawContent,
        severity: 'normal',
        suggestedPrompts: [
          'More details bolbo',
          'Kon doctor er kache jabo?',
          'Home care tips din'
        ]
      };
    }

    // Ensure fallback fields exist
    const reply = parsedResult.reply || 'Apnar symptoms ta r ektu bistarto bolun.';
    const severity = parsedResult.severity || 'normal';
    const suggestedPrompts = Array.isArray(parsedResult.suggestedPrompts) && parsedResult.suggestedPrompts.length > 0
      ? parsedResult.suggestedPrompts
      : ['Kon doctor er kache jabo?', 'Home care tips ki?', 'Severe issue kina kaise bujhbo?'];

    res.json({
      reply,
      severity,
      suggestedPrompts
    });
  } catch (error) {
    console.error('AI Triage Error:', error);
    res.status(500).json({ message: 'Server error during AI triage process' });
  }
};

module.exports = {
  triagePatient
};

