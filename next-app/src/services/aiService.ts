import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface PredictBattleFeedback {
  analysis: string;
  strengths: string[];
  improvements: string[];
  marketInsight: string;
}

/**
 * Generate AI feedback for Predict Battle results
 */
export async function generatePredictBattleFeedback(
  prediction: 'UP' | 'DOWN',
  actualDirection: 'UP' | 'DOWN',
  priceChangePercent: number,
  displayDuration: number,
  chartData: { timestamp: number; price: number }[]
): Promise<PredictBattleFeedback> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a professional trading mentor analyzing a student's price prediction.

**Scenario:**
- Chart shown for: ${displayDuration} seconds
- Student predicted: ${prediction}
- Actual price movement: ${actualDirection}
- Price change: ${priceChangePercent > 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%
- Result: ${prediction === actualDirection ? '✅ CORRECT' : '❌ INCORRECT'}

**Chart Data (last 10 points):**
${chartData.slice(-10).map((d, i) => `${i + 1}. $${d.price.toFixed(2)}`).join('\n')}

Provide constructive feedback in JSON format:
{
  "analysis": "2-3 sentence analysis of what happened and why",
  "strengths": ["1-2 things they did well or could leverage"],
  "improvements": ["1-2 specific tips to improve future predictions"],
  "marketInsight": "1 interesting market behavior insight from this chart"
}

Keep it encouraging, educational, and concise. Focus on pattern recognition and timing.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if parsing fails
    return {
      analysis: prediction === actualDirection 
        ? "Great prediction! You correctly identified the market direction."
        : "The market moved against your prediction. Market timing can be tricky!",
      strengths: ["Quick decision making", "Understanding of basic trends"],
      improvements: ["Study more chart patterns", "Wait for stronger signals"],
      marketInsight: "Short-term price movements can be volatile and unpredictable."
    };
  } catch (error) {
    console.error('Gemini AI error:', error);
    // Fallback response
    return {
      analysis: prediction === actualDirection 
        ? "Nice work! You predicted the correct direction."
        : "Close one! The market didn't move as expected.",
      strengths: ["Pattern recognition", "Quick thinking"],
      improvements: ["Study volume indicators", "Look for trend reversals"],
      marketInsight: "Market psychology plays a huge role in short-term movements."
    };
  }
}

export interface BattleRoyaleFeedback {
  overall: string;
  tradingStyle: string;
  bestTrade: string;
  worstTrade: string;
  recommendations: string[];
}

/**
 * Generate AI feedback for Battle Royale results
 */
export async function generateBattleRoyaleFeedback(
  trades: Array<{ type: 'BUY' | 'SELL'; price: number; timestamp: number; profit?: number }>,
  finalProfit: number,
  opponentProfit: number,
  chartData: { timestamp: number; price: number }[]
): Promise<BattleRoyaleFeedback> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const won = finalProfit > opponentProfit;
  const tradesSummary = trades.map((t, i) => 
    `${i + 1}. ${t.type} at $${t.price.toFixed(2)} ${t.profit !== undefined ? `(P/L: ${t.profit > 0 ? '+' : ''}$${t.profit.toFixed(2)})` : ''}`
  ).join('\n');

  const prompt = `You are a professional trading coach analyzing a 30-second trading battle.

**Battle Results:**
- Your Profit: $${finalProfit.toFixed(2)}
- Opponent Profit: $${opponentProfit.toFixed(2)}
- Result: ${won ? '🏆 VICTORY' : '💪 DEFEAT'}
- Trades Made: ${trades.length}

**Your Trades:**
${tradesSummary}

**Price Range:** $${Math.min(...chartData.map(d => d.price)).toFixed(2)} - $${Math.max(...chartData.map(d => d.price)).toFixed(2)}

Provide detailed feedback in JSON format:
{
  "overall": "2-3 sentence overall performance summary",
  "tradingStyle": "Describe their trading style (e.g., aggressive, conservative, etc.)",
  "bestTrade": "Highlight their best trade and why it was good",
  "worstTrade": "Point out a mistake or missed opportunity",
  "recommendations": ["3 specific actionable tips to improve"]
}

Be encouraging but honest. Focus on strategy, timing, and risk management.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      overall: won ? "Solid performance! Your trades were well-timed." : "Good effort! There's room for improvement in your strategy.",
      tradingStyle: trades.length > 3 ? "Aggressive, high-frequency" : "Conservative, selective",
      bestTrade: trades[0] ? `Your ${trades[0].type} at $${trades[0].price.toFixed(2)} showed good timing` : "N/A",
      worstTrade: "Consider waiting for stronger entry signals",
      recommendations: [
        "Look for clear trend reversals before entering",
        "Practice better position sizing",
        "Study support and resistance levels"
      ]
    };
  } catch (error) {
    console.error('Gemini AI error:', error);
    return {
      overall: "You showed good decision-making under pressure!",
      tradingStyle: "Adaptive",
      bestTrade: "Quick decision execution",
      worstTrade: "Some trades could have been better timed",
      recommendations: [
        "Focus on entry and exit timing",
        "Study market patterns more",
        "Practice risk management"
      ]
    };
  }
}

