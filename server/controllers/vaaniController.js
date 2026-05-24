const { GoogleGenAI } = require('@google/genai');
const User = require('../models/User');
const Claim = require('../models/Claim');
const Risk = require('../models/Risk');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Handle Vaani Chat request
 * @route POST /api/vaani/chat
 * @access Private
 */
const handleVaaniChat = async (req, res) => {
  try {
    const { history, message } = req.body;
    const user = req.user;

    // Build context
    const claims = await Claim.find({ userId: user._id }).sort({ createdAt: -1 }).limit(3);
    const latestRisk = await Risk.findOne({ userId: user._id }).sort({ createdAt: -1 });

    const totalClaims = claims.length;
    const lastClaimAmt = totalClaims > 0 ? claims[0].amount : 0;
    const currentRisk = latestRisk ? latestRisk.score : 'unknown';

    // System instruction (Personality + Data injection)
    const systemPrompt = `You are VAANI, the friendly and supportive AI assistant for GigGuard. 
    GigGuard provides parametric income protection for gig workers in India against weather and pollution.
    
    You are talking to: ${user.name}
    Their platform: ${user.provider || 'Gig Platform'}
    Their city/zone: ${user.city || 'Mumbai'} / ${user.zone || 'Unknown'}
    Their current weekly earning protection limit: ₹${user.weeklyEarnings || 0}
    Their latest risk score: ${currentRisk}/100 (INDRA model)
    Their recent claims count: ${totalClaims} (Last payout: ₹${lastClaimAmt})
    
    CRITICAL BOUNDARY RULE:
    You MUST ONLY answer questions strictly related to GigGuard, weather risks, parametric insurance, payouts, claims, their gig platform work (Zomato/Swiggy), or their risk score / dashboard. 
    If they ask about an unrelated topic (e.g. daily personal problems, general knowledge, coding, politics, philosophy, etc.), gently but firmly decline to answer and steer them back to their GigGuard protection plan.
    
    TONE: Professional, empathetic, direct, and slightly informal. Never mention that you are a large language model. Speak as though you are a dedicated GigGuard agent checking their actual file. Use ₹ symbol for currency. 
    Keep responses concise (under 3-4 sentences max).`;

    // Map history to Google GenAI format if history is provided
    let contents = [];
    
    if (history && Array.isArray(history)) {
      contents = history.map(msg => ({
        role: msg.sender === 'vaani' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));
    }
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({
      success: true,
      text: response.text
    });

  } catch (err) {
    console.error('Vaani Error:', err);
    res.status(500).json({ success: false, message: 'I am taking a quick break, please try again in a moment.' });
  }
};

module.exports = { handleVaaniChat };
