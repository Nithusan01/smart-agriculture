const { Op } = require('sequelize');
const {Disease} = require('../models/index');
const {ChatHistory} = require('../models/index');
const natural = require('natural');

class ChatbotService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.classifier = new natural.BayesClassifier();
    this.initializeClassifier();
  }

  async initializeClassifier() {
    const trainingData = [
      { text: "my plant has white spots", intent: "symptom_description" },
      { text: "what disease does my plant have", intent: "disease_identification" },
      { text: "how to treat powdery mildew", intent: "treatment_request" },
      { text: "prevent diseases in wheat", intent: "prevention_request" },
      { text: "hello", intent: "greeting" },
      { text: "hi", intent: "greeting" },
      { text: "thanks", intent: "gratitude" },
      { text: "thank you", intent: "gratitude" }
    ];

    trainingData.forEach(data => {
      this.classifier.addDocument(data.text, data.intent);
    });

    this.classifier.train();
  }

  async processMessage(userMessage, context = {}, userId = null) {
    const intent = this.classifier.classify(userMessage);
    let response;

    switch(intent) {
      case 'greeting':
        response = await this.handleGreeting();
        break;
      case 'symptom_description':
        response = await this.handleSymptomDescription(userMessage, context);
        break;
      case 'disease_identification':
        response = await this.handleDiseaseIdentification(userMessage, context);
        break;
      case 'treatment_request':
        response = await this.handleTreatmentRequest(userMessage);
        break;
      case 'prevention_request':
        response = await this.handlePreventionRequest(userMessage);
        break;
      case 'gratitude':
        response = await this.handleGratitude();
        break;
      default:
        response = await this.handleUnknownQuery();
    }

    // Save chat history if user is logged in
    if (userId) {
      await this.saveChatHistory(userId, userMessage, response, intent);
    }

    return response;
  }

  async saveChatHistory(userId, userMessage, botResponse, intent) {
    try {
      await ChatHistory.create({
        userId,
        userMessage,
        botResponse,
        intent,
        symptomsIdentified: botResponse.symptoms || []
      });
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  async handleGreeting() {
    return {
      response: "Hello! I'm your agriculture disease assistant. I can help you identify plant diseases, suggest treatments, and provide preventive measures. Please describe your plant's symptoms or ask about a specific disease.",
      suggestions: [
        "Describe symptoms",
        "Common wheat diseases", 
        "Organic treatment options",
        "Disease prevention tips"
      ]
    };
  }

  async handleSymptomDescription(userMessage, context) {
    const symptoms = this.extractSymptoms(userMessage);
    
    if (symptoms.length === 0) {
      return {
        response: "I couldn't identify specific symptoms. Could you please describe what you're seeing on your plants? For example: 'yellow spots on leaves' or 'white powder on stems'.",
        needsClarification: true,
        symptoms: []
      };
    }

    const matchingDiseases = await this.findDiseasesBySymptoms(symptoms);
    
    if (matchingDiseases.length === 0) {
      return {
        response: "I couldn't find diseases matching those symptoms. Could you provide more details about the affected plant type and symptoms?",
        needsClarification: true,
        symptoms: symptoms
      };
    }

    return {
      response: `Based on the symptoms "${symptoms.join(', ')}", I found ${matchingDiseases.length} possible diseases:`,
      diseases: matchingDiseases.map(d => ({
        id: d.id,
        name: d.diseaseName,
        severity: d.severity,
        primarySymptom: d.symptoms || 'Various symptoms',
        treatment: d.treatment || 'No treatment info available',
        description: d.description || 'No description available'
      })),
      symptoms: symptoms,
      suggestions: matchingDiseases.map(d => `Tell me about ${d.diseaseName}`)
    };
  }

 extractSymptoms(message) {
  const text = message.toLowerCase();

  // Expanded dictionary of plant symptom keywords
  const symptomKeywords = [
    'spot', 'leaf spot', 'brown spot', 'yellow spot',
    'powder', 'powdery', 'mildew',
    'yellow', 'yellowing', 'chlorosis',
    'brown', 'black', 'white',
    'fungus', 'fungal', 'mold', 'mould',
    'rot', 'root rot', 'stem rot',
    'wilt', 'wilting',
    'blight', 'canker',
    'lesion', 'patches', 'necrosis',
    'curl', 'leaf curl',
    'dry', 'drying',
    'decay', 'dying'
  ];

  const tokens = this.tokenizer.tokenize(text);
  const stems = tokens.map(t => natural.PorterStemmer.stem(t));

  const found = new Set();

  // 1. Word-level matching
  symptomKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      found.add(keyword);
    }
  });

  // 2. Stem-level matching (example: yellowing -> yellow)
  symptomKeywords.forEach(keyword => {
    const keyStem = natural.PorterStemmer.stem(keyword);
    if (stems.includes(keyStem)) {
      found.add(keyword);
    }
  });

  // 3. Phrase extraction (two-word combos)
  for (let i = 0; i < tokens.length - 1; i++) {
    const phrase = `${tokens[i]} ${tokens[i + 1]}`;
    symptomKeywords.forEach(keyword => {
      if (phrase.includes(keyword)) {
        found.add(keyword);
      }
    });
  }

  return [...found];
}


  async findDiseasesBySymptoms(symptoms) {
    if (!symptoms || symptoms.length === 0) return [];

    try {
      const diseases = await Disease.findAll({
        where: {
          [Op.or]: [
            ...symptoms.map(symptom => ({
              'symptoms': { [Op.iLike]: `%${symptom}%` }
            })),
            ...symptoms.map(symptom => ({
              'description': { [Op.iLike]: `%${symptom}%` }
            }))
          ]
        },
        limit: 5,
        attributes: ['id', 'diseaseName', 'severity', 'symptoms', 'description', 'treatment']
      });

      return diseases;
    } catch (error) {
      console.error('Error finding diseases by symptoms:', error);
      return [];
    }
  }

  async handleTreatmentRequest(diseaseName) {
    const disease = await Disease.findOne({
      where: {
        name: {
          [Op.iLike]: `%${diseaseName}%`
        }
      }
    });

    if (!disease) {
      return {
        response: `I couldn't find information about "${diseaseName}". Could you check the spelling or describe the symptoms?`
      };
    }

    return {
      response: `Treatment options for ${disease.name}:`,
      disease: {
        name: disease.name,
        scientificName: disease.scientificName
      },
      treatments: {
        organic: disease.organicTreatment,
        chemical: disease.chemicalTreatment
      },
      preventive: disease.preventiveMeasures,
      suggestions: [
        "More prevention tips",
        "Similar diseases",
        "Start new conversation"
      ]
    };
  }

  async handlePreventionRequest(cropType) {
    const diseases = await Disease.findAll({
      where: {
        affectedCrops: {
          [Op.contains]: [cropType]
        }
      },
      limit: 5
    });

    if (diseases.length === 0) {
      return {
        response: `I don't have specific prevention tips for ${cropType}. Could you specify which crop you're concerned about?`
      };
    }

    const allPreventiveMeasures = [...new Set(
      diseases.flatMap(d => d.preventiveMeasures)
    )];

    return {
      response: `Prevention tips for ${cropType} diseases:`,
      preventiveMeasures: allPreventiveMeasures.slice(0, 8), // Top 8 measures
      commonDiseases: diseases.map(d => d.name),
      suggestions: diseases.map(d => `Treat ${d.name}`)
    };
  }

  async handleGratitude() {
    return {
      response: "You're welcome! I'm glad I could help. Feel free to ask more questions about plant diseases or treatments.",
      suggestions: [
        "Report another issue",
        "Learn about organic treatments",
        "Disease prevention guide"
      ]
    };
  }

  async handleUnknownQuery() {
    return {
      response: "I'm not sure I understand. I can help with disease identification, treatment recommendations, and preventive measures. Could you rephrase your question?",
      suggestions: [
        "How to identify plant diseases",
        "Common crop diseases",
        "Organic treatment methods"
      ]
    };
  }

  // New method to get disease by ID
  async getDiseaseById(diseaseId) {
    return await Disease.findByPk(diseaseId);
  }

  // New method to get user chat history
  async getUserChatHistory(userId, limit = 10) {
    return await ChatHistory.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: limit
    });
  }
}

module.exports = new ChatbotService();