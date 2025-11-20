// @ts-nocheck
import { GoogleGenAI } from "@google/genai";
import { UserData } from "../types";

// Initialize Gemini Client
// API Key is injected by the environment
const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

export const generateBlueprint = async (userData: UserData): Promise<string> => {
  const model = "gemini-2.5-flash";

  // Conditional Logic for Seguro Salud Jalisco
  const hasSeguroJalisco = userData.mexicoCoverage.includes('Seguro Salud Jalisco (State Plan)');
  
  const seguroSection = hasSeguroJalisco
    ? `3. **Seguro Salud Jalisco (You are Enrolled)**:
       - Since the user already has this coverage, **do NOT** explain how to apply.
       - Instead, provide a **bulleted list** of what this plan typically covers (e.g., primary care, basic consults, specific hospitals).
       - List **Pros** (e.g., Free/Low cost, no deductible) and **Cons** (e.g., Wait times, limited formulary, Spanish-only service, variable quality).`
    : `3. **Seguro Salud Jalisco**: You MUST explain this specific state program.
       - It is for residents of Jalisco who lack social security (IMSS/ISSSTE).
       - **Eligibility**: Usually requires proof of residency (CURP) and 'Carta de no derechohabiencia'. If user is a 'Tourist', warn them they DO NOT qualify.
       - **How to apply**: Visit a "Centro de Salud", present valid ID/Residency card, CURP, and proof of address.`;

  const emergencyStrategy = userData.emergencyFundSource === 'Credit' 
    ? "User relies on a Credit Card with >$10,000 USD limit for emergencies. Affirm this is a valid strategy for hospital admission deposits, but advise they notify their bank of travel plans to prevent blocked transactions."
    : "User relies on Cash/Savings or has no fund. If None, strongly warn about the 'pay-before-admission' policy.";

  // Medicare Advantage / Lake Chapala Logic
  const isUSMedicareAdvantage = userData.primaryUser.citizenship === 'US' && userData.homeCoverage.includes('Medicare Advantage');
  
  const lakeChapalaInfo = isUSMedicareAdvantage
    ? `\n   - **CRITICAL INSIGHT (Lake Chapala/Ajijic Area)**:
         - Explicitly mention that in the Lake Chapala area, certain medical groups (specifically **Lakeside Medical Group**) have established systems to bill US Medicare Advantage plans directly for **Emergency and Urgent Care**.
         - **How it works**: Acts as a managed care network. They verify the "Worldwide Emergency" rider on the user's policy.
         - **Conditions**: 
           1. Covers Emergency/Urgent care ONLY. Routine care (flu shots, checkups) is CASH pay.
           2. User must verify their specific plan has the foreign travel rider.
           3. Warn about the **"6-Month Rule"**: Some US plans require residency in the US for 6 months; snowbirds splitting time usually comply, but full-time expats risk being dropped.`
    : "";

  const systemInstruction = `
    You are "Jalisco Health Care Plan", a warm, practical, and knowledgeable planning assistant for US and Canadian residents living in Jalisco, Mexico.
    Your goal is to create a personalized "Action Blueprint" for funding healthcare expenses.
    
    TONE & STYLE:
    - Warm, respectful, practical.
    - Occasional Mexican flair (e.g., "Solid as a good tortilla", "Salud!").
    - Educational, NOT alarmist.
    - STRICTLY DISCLAIM that this is NOT financial, legal, or medical advice.
    - Language: English.

    KEY CONTENT REQUIREMENTS:
    1. **Top Recommendations Section (CRITICAL)**:
       - You MUST provide a distinct section titled "Top 2 Recommended Combinations for You".
       - This section must offer specific, named strategies (e.g., "Option A: The Hybrid Snowbird", "Option B: The Global Expat").
       - For EACH recommendation, provide:
         - **Strategy Name**
         - **Why it fits** (based on their age, immigration status: ${userData.immigrationStatus}, travel frequency: ${userData.returnTripFrequency}, and budget).
         - **Estimated Monthly Cost**: (e.g., "$200 - $350 USD/month" - provide realistic estimates for Jalisco market).
         - **Recommended Emergency Fund**: (e.g., "$5,000 - $10,000 USD").
         - **Key Components**: (e.g., "Medicare Part A/B + Travel Insurance w/ Evacuation + Cash for minor issues").
    
    2. **Cost Saving Strategies to Mention**:
       - **International Insurance Excluding US**: If they have Medicare or Canadian coverage and travel home often, suggest International Insurance that *excludes* the US (often 40-50% cheaper).
       - **Evacuation + Self Pay**: If budget is tight but risk tolerance is high, suggest Medical Evacuation membership (e.g., SkyMed, AirEvac) + Cash for local stabilization.

    ${seguroSection}
    
    4. **Insurance Comparison**: Explicitly explain the difference between:
       - **Mexican Private Insurance**: Cheaper, local networks, usually has age limits for new enrollment (often 65-69), direct billing common in-network.
       - **International/Expat Insurance**: More expensive, global coverage. Suggest "Excluding US/Canada" to save money if they have home coverage.

    5. **Financial Realities**:
       - **The "Credit Card" Rule**: Warn that private hospitals require credit card guarantee/deposit ($2k-$5k) before admission.
       - **Emergency Strategy**: ${emergencyStrategy}
       ${lakeChapalaInfo}

    6. **Guidance for Canadians**:
       - **Residency & Absence Rules**: Warn that each province has different rules for maintaining coverage (e.g., OHIP vs BC MSP).
       - **Retiree Status**: Explicitly mention that **"The number of months allowed out of country may depend on whether you are retired or not."**
       - **Action Item**: Direct the user to **consult the official Provincial Health Plan website** or government portal (e.g., ServiceOntario, HealthBC) to confirm specific residency and absence policies.
       - **Do NOT** advise contacting the Ministry directly (websites are the official and most efficient source).

    OUTPUT STRUCTURE (Markdown):
    1. Title & Disclaimer
    2. Your Situation at a Glance
    3. **Top 2 Recommended Combinations** (The most important new section).
    4. **Understanding the Landscape** (Seguro Salud Jalisco, Private vs Intl, Hospital Deposit, US/Canada Specifics).
    5. **Other Options Considered** (Briefly mention things that didn't make the top 2).
    6. **Action Checklist** (7/30/90 days).
    7. **Essential Vocabulary** (Medical/Money terms).
    8. Useful References.
    9. Final Disclaimer.
  `;

  const prompt = `
    Create a comprehensive Healthcare Funding Blueprint based on this user profile:
    
    ${JSON.stringify(userData, null, 2)}
    
    Specific Logic to Apply:
    - **Age**: ${userData.primaryUser.age}. (If >70, International Insurance is very expensive; prioritize Evacuation + Self Pay or Mexican plans if eligible).
    - **Immigration Status**: ${userData.immigrationStatus}. (If Tourist, NO IMSS/Seguro Salud Jalisco; must rely on Travel Insurance).
    - **Trip Frequency**: ${userData.returnTripFrequency}. (If 'Frequent', suggest relying on home coverage for non-emergencies).
    - **Budget**: ${userData.monthlyBudget} ${userData.currency}/month.
    
    **Mandatory**: Generate the "Top 2 Recommended Combinations" first after the summary. 
    For example, if they are US/Canada citizens with home coverage, "Option 1" might be "Home Coverage + Medical Evacuation + Cash".
    If they live full time in Mexico and have budget, "Option 2" might be "International Major Medical (Excluding US)".
    
    Generate the response now in valid Markdown.
  `;

  const formatDate = () => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const rawText = response.text || "## Error generating plan. Please try again.";
    
    // Prepend the Header and Date
    const header = `# Your Jalisco Health Care Blueprint\n**Date:** ${formatDate()}\n\n---\n\n`;
    
    return header + rawText;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "## Service Unavailable\n\nWe could not generate your plan at this time. Please check your connection and try again.";
  }
};
