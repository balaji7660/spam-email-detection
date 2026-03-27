class ScamDetector {
  constructor() {
    this.spamWords = [
      "urgent", "winner", "lottery", "prize", "cash", "crypto", "bitcoin", 
      "otp", "password", "bank", "account", "block", "freeze", "free", 
      "gift", "subscribe", "guaranteed", "investment", "double", "returns",
      "kyc", "verify", "suspended", "lucky", "claim", "crore", "hiring",
      "salary", "offer"
    ];
    this.hamWords = [
      "meeting", "lunch", "project", "report", "hello", "hi", "how", "are", 
      "you", "thanks", "regards", "sincerely", "sync", "team", "review", 
      "attached", "deck", "discussion", "invoice"
    ];
    this.triggers = {
      "Urgency": ["urgent", "now", "immediately", "quick", "fast", "today", "within", "soon", "expire"],
      "Reward": ["free", "bonus", "gift", "win", "winner", "prize", "cash", "extra", "lucrative"],
      "Fear": ["arrest", "court", "penalty", "fine", "jail", "block", "police", "suspended", "freeze", "locked"]
    };
  }

  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  analyze(text) {
    if (!text || text.trim() === '') return { confidence: 0, type: "Not Spam", risk_label: "Low", triggers: [], highlights: [], backend: "Local JS" };
    
    const tokens = this.tokenize(text);
    let spamScore = 0;
    let hamScore = 0;
    let detectedTriggers = new Set();
    let highlights = [];

    // Basic Tfidf mock scoring via frequencies
    tokens.forEach(token => {
      if (this.spamWords.includes(token)) {
        spamScore += 2;
        highlights.push(token);
      }
      if (this.hamWords.includes(token)) {
        hamScore += 1;
      }

      // Check psychological triggers
      for (const [triggerType, triggerWords] of Object.entries(this.triggers)) {
        if (triggerWords.includes(token)) {
          detectedTriggers.add(triggerType);
        }
      }
    });

    // Phrase triggers (N-grams)
    const phraseTriggers = ["click here", "work from home", "data entry", "part-time", "customer care", "dont share"];
    phraseTriggers.forEach(phrase => {
      if (text.toLowerCase().includes(phrase)) {
        spamScore += 3;
        highlights.push(phrase);
      }
    });

    // Deduplicate highlights
    highlights = [...new Set(highlights)];

    // Bayesian-like Logic Mapping
    let totalScore = spamScore + hamScore;
    let confidence = 0;
    let classification = "Ham";

    if (totalScore === 0) {
      confidence = 10;
      classification = "Not Spam";
    } else {
      let spamProbability = spamScore / (spamScore + hamScore);
      
      // Multiplier effect for multiple triggers
      if (detectedTriggers.size > 0) {
         spamProbability += (0.15 * detectedTriggers.size);
      }

      spamProbability = Math.min(spamProbability, 0.99);

      if (spamProbability > 0.45) {
        classification = "Spam Filter Match";
        confidence = spamProbability * 100;
      } else {
        classification = "Not Spam";
        confidence = (1 - spamProbability) * 100;
      }
    }

    let riskLevel = "Low";
    if (classification === "Spam Filter Match") {
       if (confidence > 75) riskLevel = "Critical";
       else if (confidence > 50) riskLevel = "Medium";
    }

    // Determine final THREAT %
    let finalConfidence = classification === "Spam Filter Match" ? confidence : (100 - confidence);

    return {
      type: classification,
      confidence: finalConfidence,
      risk_label: riskLevel,
      triggers: Array.from(detectedTriggers),
      highlights: highlights,
      backend: "Local JavaScript NLP (Fallback)"
    };
  }
}

// Attach to window
window.ScamDetector = ScamDetector;
