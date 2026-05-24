const axios = require('axios');

const ML_API_BASE = 'https://ml-model-88cg.onrender.com/api';

/**
 * Call the unified /predict endpoint which executes:
 * 1. INDRA (Risk Engine)
 * 2. KAVACH (Fraud Detection)
 * 3. DHAN (Dynamic Payout calculation)
 *
 * @param {Object} payload 
 */
const predictFullPipeline = async (payload) => {
  try {
    const { data } = await axios.post(`${ML_API_BASE}/predict`, payload, {
      timeout: 15000 // ML API might have warm-up delay on Render
    });
    return data;
  } catch (err) {
    console.error(`⚠️ ML Engine Error (${err.message}): Falling back to safe defaults.`);
    
    // Graceful fallback if the external ML API is down
    return {
      success: false,
      status: "Approved ✅",
      plan: "standard",
      indra: {
        risk_score: payload.rain * 2 + payload.aqi / 5,
        risk_label: payload.rain > 10 ? "HIGH" : "LOW",
        auto_claim_trigger: payload.rain > 15,
        raw_probability: 0.5
      },
      kavach: {
        fraud: false,
        fraud_score: 0.0
      },
      payout: {
        plan: "standard",
        plan_cost: 49,
        predicted_payout: 320,
        final_payout: 320
      }
    };
  }
};

module.exports = { predictFullPipeline };
