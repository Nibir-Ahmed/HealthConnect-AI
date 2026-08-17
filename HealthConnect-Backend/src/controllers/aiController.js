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

    // System prompt instructing AI for Banglish support, direct medical triage, and prompt generation
    const systemMessage = {
      role: 'system',
      content: `You are HealthConnect AI, a fast, highly practical, and decisive medical AI assistant.
      
CRITICAL INSTRUCTIONS:
1. Direct, Quick & Actionable Answers:
   - DO NOT waste time asking endless follow-up questions.
   - Immediately provide 3-4 clear, bulleted steps:
     * Immediate home remedies / lifestyle actions (e.g. food, water, rest, posture).
     * Common safe OTC medicines or natural care advice (always note to check with doctor/pharmacist).
     * Clear warning signs when to rush to a hospital/doctor.
     * Which specialist doctor they should consult if it persists.
2. Language:
   - If the user types in Banglish (e.g., "amar constipation hocce", "matha batha ki korbo"), reply in natural, everyday conversational Banglish.
   - If user types in Bengali or English, match their language.
3. Tone:
   - Empathetic, crisp, and to the point. Keep formatting clean with bullet points and bold highlights.
4. Output Schema:
   - You MUST output ONLY valid JSON matching this schema:
     {
       "reply": "string (Crisp, direct markdown formatted medical advice in user's language)",
       "severity": "normal" | "high" | "critical",
       "suggestedPrompts": [
         "Short prompt 1",
         "Short prompt 2",
         "Short prompt 3"
       ]
     }`
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

