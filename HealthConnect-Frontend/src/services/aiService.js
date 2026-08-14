// HealthConnect AI Clinical Triage & Consultation Service

const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'cannot breathe', 'shortness of breath', 'shash nite kosto',
  'unconscious', 'severe bleeding', 'stroke', 'paralysis', 'poisoning', 'bikh', 'severe burn',
  'head injury', 'seizure', 'convulsion', 'heavy blood loss'
];

const SPECIALTY_MAP = {
  cardiology: ['heart', 'chest pain', 'palpitation', 'bp', 'blood pressure', 'hypertension', 'buke batha'],
  dermatology: ['skin', 'rash', 'itching', 'allergy', 'acne', 'chulkani', 'eczema', 'pimples'],
  pediatrics: ['baby', 'child', 'baccha', 'infant', 'toddler', 'shishu'],
  mental_health: ['depression', 'anxiety', 'panic', 'stress', 'sleep', 'insomnia', 'chinta', 'mon kharap'],
  orthopedics: ['bone', 'joint', 'fracture', 'back pain', 'knee', 'spine', 'komor batha', 'hada batha'],
  ent: ['ear', 'nose', 'throat', 'kan', 'gala', 'hearing', 'sinus', 'tonsil'],
  general: ['fever', 'cold', 'flu', 'jor', 'kashi', 'headache', 'matha batha', 'vomiting', 'diarrhea', 'pet kharap']
};

export const processAITriage = async (queryText, chatHistory = []) => {
  const queryLower = queryText.toLowerCase();

  // 1. Determine severity
  const isEmergency = EMERGENCY_KEYWORDS.some(k => queryLower.includes(k));
  let severity = 'low';
  if (isEmergency) {
    severity = 'critical';
  } else if (queryLower.includes('fever') || queryLower.includes('jor') || queryLower.includes('pain') || queryLower.includes('batha')) {
    severity = 'moderate';
  }

  // 2. Identify likely specialty
  let recommendedSpecialty = 'General Physician';
  for (const [specialty, keywords] of Object.entries(SPECIALTY_MAP)) {
    if (keywords.some(k => queryLower.includes(k))) {
      switch (specialty) {
        case 'cardiology': recommendedSpecialty = 'Cardiologist'; break;
        case 'dermatology': recommendedSpecialty = 'Dermatologist'; break;
        case 'pediatrics': recommendedSpecialty = 'Pediatrician'; break;
        case 'mental_health': recommendedSpecialty = 'Psychiatrist'; break;
        case 'orthopedics': recommendedSpecialty = 'Orthopedic'; break;
        case 'ent': recommendedSpecialty = 'ENT Specialist'; break;
        default: recommendedSpecialty = 'General Physician';
      }
      break;
    }
  }

  // 3. Generate empathetic medical response
  let responseText = '';
  let suggestedPrompts = [];

  if (isEmergency) {
    responseText = `⚠️ **URGENT MEDICAL ALERT**: Apnar lakkhon gulo (symptoms) urgent clinical attention demand kore.\n\n` +
      `🚨 **Immediate Actions**:\n` +
      `1. Bishram nin (Sit or lie down in a comfortable position).\n` +
      `2. Kono heavy physical activity korben na.\n` +
      `3. Platform-er **1-Tap SOS** button chepe emergency hotline (911/999) ba nearest hospital emergency department-e jogajog korun.\n\n` +
      `Amader verified ${recommendedSpecialty} er sathe emergency consult start korte chaile niche "Find Doctors" e click korun.`;
    suggestedPrompts = [
      "Nearest Emergency Hospital kothay?",
      "Doctor er shathe instant call kora jabe?",
      "First aid ki korbo?"
    ];
  } else if (queryLower.includes('jor') || queryLower.includes('fever') || queryLower.includes('matha batha') || queryLower.includes('headache')) {
    responseText = `Ami bujhte parchhi apnar khub oshobidha hochhe. Jor (fever) ebong matha batha shadharonoto viral infection, fatigue ba dehydration er karone hote pare.\n\n` +
      `📋 **Primary Advice & Care**:\n` +
      `• **Hydration**: Prochur porimane jol, daaber jol ba oral rehydration solution (ORS) khan.\n` +
      `• **Rest**: Purno bishram nin ebong screentime komiye din.\n` +
      `• **Temperature Monitoring**: Prottek 4-6 ghonta por thermometer diye temperature track korun.\n` +
      `• **Consultation**: Jor jodi 102°F er beshi hoy ba 3 din er beshi thake, tobe **${recommendedSpecialty}** er kache consult kora dorkar.`;
    suggestedPrompts = [
      "Kono medicine nite hobe?",
      "Kon test kora uchit?",
      "Doctor er appointment book korbo"
    ];
  } else if (queryLower.includes('pet') || queryLower.includes('stomach') || queryLower.includes('vomit') || queryLower.includes('diarrhea')) {
    responseText = `Stomach upset ebong vomiting/diarrhea hole body theke electrolytes rapidly drop hoy.\n\n` +
      `💧 **Care Protocol**:\n` +
      `1. Prottek bar toilet jaoar por 1 glass ORS (Saline) khan.\n` +
      `2. Tel-mosla jukto khabar ebon dairy items avoid korun. Shada vaat, kola ba toast khete paren.\n` +
      `3. Severe abdominal pain ba dehydration hole instant doctor consultation nin.`;
    suggestedPrompts = [
      "ORS kivabe banabo?",
      "Doctor consult korbo",
      "Koto din e thik hobe?"
    ];
  } else if (queryLower.includes('skin') || queryLower.includes('rash') || queryLower.includes('allergy') || queryLower.includes('chulkani')) {
    responseText = `Skin irritation ba rash shadharonoto contact dermatitis, food sensitivity ba fungal reaction er karone hoy.\n\n` +
      `✨ **Care Tips**:\n` +
      `• Affected area bar-bar touch ba scratch korben na.\n` +
      `• Thanda jol ba ice pack diye compress nite paren.\n` +
      `• Harsh soaps avoid korun ebong gentle moisturizer use korun.\n` +
      `• Accurate diagnosis er jonno ekjon **Dermatologist** ke dekhano shobcheye safe.`;
    suggestedPrompts = [
      "Dermatologist er appointment book kori",
      "Kono cream use kora jabe?",
      "Allergy test ki kora lage?"
    ];
  } else {
    responseText = `Apnar query ti ami analyze korechhi. HealthConnect AI apnar health support-er jonno 24/7 active ache.\n\n` +
      `💡 **General Guidance**:\n` +
      `• Apnar symptoms gulo kobe theke shuru hoyechhe ebong kono purono medical history ache kina ta note kore rakhun.\n` +
      `• Ekti balanced diet ebong adequate sleep maintain korun.\n` +
      `• Detailed evaluation er jonno HealthConnect er verified **${recommendedSpecialty}** der kach theke tele-consultation nite paren.`;
    suggestedPrompts = [
      "Find top rated doctors",
      "Check health articles",
      "Book an appointment"
    ];
  }

  // Artificial natural thinking pause
  await new Promise(res => setTimeout(res, 600));

  return {
    reply: responseText,
    severity,
    recommendedSpecialty,
    suggestedPrompts
  };
};

export default {
  processAITriage
};
