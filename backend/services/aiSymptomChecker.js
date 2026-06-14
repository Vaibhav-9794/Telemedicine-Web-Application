/**
 * Rule-based Symptom Checker Service
 */

const SYMPTOM_RULES = [
  {
    keywords: ['fever', 'cough', 'cold', 'sore throat', 'chills', 'runny nose', 'congestion', 'flu'],
    specialization: 'General Physician',
    condition: 'Common Cold / Influenza (Flu)',
    urgency: 'Medium',
    precautions: [
      'Stay hydrated and get plenty of rest.',
      'Take over-the-counter antipyretics (like paracetamol) if fever is high.',
      'Wear a mask and self-isolate to prevent spreading.'
    ]
  },
  {
    keywords: ['chest pain', 'heart rate', 'palpitations', 'shortness of breath', 'tightness', 'breathing difficulty'],
    specialization: 'Cardiologist',
    condition: 'Cardiovascular Concern',
    urgency: 'High',
    precautions: [
      'Avoid any physical strain or exercise immediately.',
      'If pain spreads to the left arm, neck, or jaw, call emergency services immediately.',
      'Sit in a comfortable, upright position and try to keep calm.'
    ]
  },
  {
    keywords: ['headache', 'migraine', 'dizziness', 'seizure', 'numbness', 'tingling', 'paralysis', 'confusion'],
    specialization: 'Neurologist',
    condition: 'Neurological Condition / Migraine',
    urgency: 'Medium',
    precautions: [
      'Rest in a quiet, dark room.',
      'Avoid looking at phone, computer, or TV screens.',
      'Hydrate well and note down how long the episode lasts.'
    ]
  },
  {
    keywords: ['skin', 'rash', 'itch', 'redness', 'acne', 'eczema', 'allergy', 'hives', 'blister'],
    specialization: 'Dermatologist',
    condition: 'Skin Allergy / Dermatitis',
    urgency: 'Low',
    precautions: [
      'Do not scratch or rub the affected skin area.',
      'Apply a cool, damp compress to relieve itching.',
      'Avoid using perfumed soaps, cosmetics, or harsh detergents.'
    ]
  },
  {
    keywords: ['stomach', 'diarrhea', 'vomiting', 'nausea', 'acid', 'bloating', 'cramp', 'indigestion', 'heartburn'],
    specialization: 'Gastroenterologist',
    condition: 'Gastrointestinal Infection / Acid Reflux',
    urgency: 'Medium',
    precautions: [
      'Sip on clear fluids or Oral Rehydration Solutions (ORS).',
      'Follow a bland diet (toast, rice, applesauce, bananas).',
      'Avoid dairy, caffeine, alcohol, and spicy or greasy foods.'
    ]
  },
  {
    keywords: ['anxiety', 'depress', 'stress', 'insomnia', 'mood', 'panic', 'mental', 'suicid'],
    specialization: 'Psychiatrist',
    condition: 'Mental Health Concern',
    urgency: 'Low',
    precautions: [
      'Practice deep breathing exercises or guided meditation.',
      'Limit intake of stimulants like coffee or energy drinks.',
      'Reach out to a trusted friend, family member, or mental health support hotline.'
    ]
  },
  {
    keywords: ['bone', 'joint', 'fracture', 'sprain', 'muscle pain', 'backache', 'swelling', 'knee pain'],
    specialization: 'Orthopedician',
    condition: 'Musculoskeletal Sprain / Injury',
    urgency: 'Medium',
    precautions: [
      'Follow the R.I.C.E. protocol: Rest, Ice, Compression, Elevation.',
      'Avoid putting weight or pressure on the affected joint or bone.',
      'Apply ice wrapped in a towel for 15-20 minutes at a time.'
    ]
  },
  {
    keywords: ['child', 'pediatric', 'baby', 'toddler', 'infant', 'colic'],
    specialization: 'Pediatrician',
    condition: 'Pediatric General Check-up',
    urgency: 'Medium',
    precautions: [
      'Monitor child\'s temperature and fluid intake.',
      'Do not administer adult medications; consult a doctor for dosage.',
      'Keep the child comfortable and dressed in light layers.'
    ]
  }
];

const checkSymptoms = (symptomText) => {
  if (!symptomText || typeof symptomText !== 'string' || symptomText.trim() === '') {
    return {
      specialization: 'General Physician',
      condition: 'Undetermined Symptoms',
      urgency: 'Low',
      precautions: [
        'Consult a general practitioner for an initial check-up.',
        'Keep record of when symptoms occur.'
      ]
    };
  }

  const textLower = symptomText.toLowerCase();
  let bestMatch = null;
  let maxMatches = 0;

  for (const rule of SYMPTOM_RULES) {
    let matches = 0;
    for (const keyword of rule.keywords) {
      if (textLower.includes(keyword)) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = rule;
    }
  }

  if (bestMatch && maxMatches > 0) {
    return {
      specialization: bestMatch.specialization,
      condition: bestMatch.condition,
      urgency: bestMatch.urgency,
      precautions: bestMatch.precautions
    };
  }

  return {
    specialization: 'General Physician',
    condition: 'General Health Inquiry',
    urgency: 'Low',
    precautions: [
      'Schedule a routine consultation with a General Physician.',
      'Track symptom changes over the next 24-48 hours.'
    ]
  };
};

module.exports = {
  checkSymptoms
};
