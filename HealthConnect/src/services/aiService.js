// HealthConnect AI Clinical Triage & Consultation Service

const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'cannot breathe', 'shortness of breath', 'shash nite kosto',
  'unconscious', 'severe bleeding', 'stroke', 'paralysis', 'poisoning', 'bikh', 'severe burn',
  'head injury', 'seizure', 'convulsion', 'heavy blood loss'
];

export const processAITriage = async (queryText, chatHistory = []) => {
  // Intelligent local real-time clinical triage & suggestion engine
  const queryLower = (queryText || '').toLowerCase();
  const isEmergency = EMERGENCY_KEYWORDS.some(k => queryLower.includes(k));
  let severity = isEmergency ? 'critical' : 'normal';

  let responseText = '';
  let suggestedPrompts = [];

  if (isEmergency) {
    responseText = `⚠️ **URGENT MEDICAL ALERT**: Apnar lakkhon gulo (symptoms) urgent clinical attention demand kore.\n\n` +
      `🚨 **Immediate Actions**:\n` +
      `1. Bishram nin (Sit or lie down in a comfortable position).\n` +
      `2. Kono heavy physical activity korben na.\n` +
      `3. Platform-er **Emergency / SOS** button chepe emergency hotline (999) ba nearest hospital-e jogajog korun.`;
    suggestedPrompts = [
      "Nearest Hospital kothay?",
      "Emergency Doctor call",
      "First aid ki korbo?"
    ];
  } else if (queryLower.includes('constipation') || queryLower.includes('koshto') || queryLower.includes('kosto') || queryLower.includes('paikhana')) {
    responseText = `Constipation (koshtha kathinno) shadharonoto dehydration, kom fiber khawa ba physical activity kom hole hoy.\n\n` +
      `💡 **Direct Action & Remedies**:\n` +
      `• **Pani**: Din-e proshur (3-4 liter) gonom pani ba normal pani khan.\n` +
      `• **High Fiber Food**: Isabgol-er bhushi (rat-e gorum doodh ba panir sathe), shobji, pepe (papaya), shosha khan.\n` +
      `• **Avoid**: Processed food, bhat/porota beshi khawa komiye din.\n` +
      `• **Medicine**: Khub beshi shamosha hole ekjon General Physician er advice niye stool softener ba syrup nite paren.`;
    suggestedPrompts = [
      "Isabgol kivabe khabo?",
      "Medicine specialist consult korbo",
      "Stomach pain hole ki korbo?"
    ];
  } else if (queryLower.includes('jor') || queryLower.includes('fever') || queryLower.includes('matha') || queryLower.includes('headache')) {
    responseText = `Jor (fever) ebong matha batha viral infection, dehydration ba fatigue er jonno hote pare.\n\n` +
      `📋 **Direct Steps**:\n` +
      `• **Hydration**: Prochur jol, daaber jol ba saline khan.\n` +
      `• **Rest**: Full rest nin.\n` +
      `• **Care**: Temperature 101°F+ hole mathay potti din ebong Paracetamol (500mg) dorkar onujayi nite paren (doctor advice shoho).\n` +
      `• 3 din er beshi jor thakle CBC/Dengue test ebong doctor consult korun.`;
    suggestedPrompts = [
      "Paracetamol koto bar khabo?",
      "Kon test lagbe?",
      "Doctor appointment"
    ];
  } else if (queryLower.includes('pet') || queryLower.includes('gastric') || queryLower.includes('gas') || queryLower.includes('vomit')) {
    responseText = `Pet kharap ba gastric problem er jonno quick guidance:\n\n` +
      `💧 **Care Protocol**:\n` +
      `1. Prottek bar patla paikhana/bomi hole 1 glass ORS (Saline) khan.\n` +
      `2. Tel, jhal, mosla-jukto khabar purapuri bondho korun.\n` +
      `3. Kacha pepe shiddho ba toast biscuit khete paren. Khub batha hole Medicine doctor consult korun.`;
    suggestedPrompts = [
      "Gastric er medicine ki?",
      "ORS kivabe khabo?",
      "Doctor consult"
    ];
  } else {
    responseText = `Apnar query ti ami bujhte perechi. Apnar shubidhar jonno direct medical guidelines:\n\n` +
      `💡 **Immediate Guidance**:\n` +
      `• Problem ta jodi 2-3 din er beshi thake ba bere jay, tobe verified doctor er sathe direct tele-consultation nite paren.\n` +
      `• Prochur pani khan ebong rest nin.\n` +
      `• Specific kono medicine ba test lagle niche suggested options select korun.`;
    suggestedPrompts = [
      "Medicine specialist consult",
      "Kono test kora lagbe?",
      "Home care tips"
    ];
  }

  return {
    reply: responseText,
    severity,
    suggestedPrompts
  };
};

export default {
  processAITriage
};
