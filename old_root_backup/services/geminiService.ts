
import { GoogleGenAI, Type } from "@google/genai";
import { User, UserRole } from '../types';

export const geminiService = {
  async generateBio(user: User, tone: string = 'Professional'): Promise<string> {
    try {
      // Fix: Always initialize GoogleGenAI inside the method to ensure it uses the most up-to-date API key.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const isBusiness = user.role === UserRole.BUSINESS;
      const context = `
        Name: ${user.name}
        Role: ${user.role}
        Tags: ${user.tags.join(', ')}
        ${isBusiness ? `Industry: ${user.industry}` : `Job: ${user.jobTitle}`}
        ${isBusiness ? `Company: ${user.company}` : `School: ${user.school}`}
      `;

      let toneInstruction = '';
      switch (tone) {
        case 'Fun': toneInstruction = 'witty, humorous, and engaging using emojis'; break;
        case 'Creative': toneInstruction = 'poetic, artistic, and unique'; break;
        case 'Hype': toneInstruction = 'energetic, persuasive, and exciting with high energy'; break;
        case 'Professional': default: toneInstruction = 'polished, concise, and trustworthy'; break;
      }

      const prompt = `Write a ${toneInstruction} bio (max 2 sentences) for a ${isBusiness ? 'brand' : 'influencer/creator'} profile on a networking app called Ping. 
      Make it sound authentic.
      User Details:
      ${context}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      // Fix: Use the .text property directly (not a method).
      return response.text?.trim() || '';
    } catch (error) {
      console.error("Gemini Bio Error:", error);
      return "Creative powerhouse ready to collaborate. Let's make magic happen! ✨"; // Fallback
    }
  },

  async generateIcebreakers(matchName: string, matchTags: string[], userRole: UserRole): Promise<string[]> {
    try {
      // Fix: Always initialize GoogleGenAI inside the method.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Generate 3 short, casual, and engaging conversation starters (icebreakers) to send to ${matchName}.
      Context: I am a ${userRole} on a professional networking app.
      Target User Interests: ${matchTags.join(', ')}.
      
      Output strictly as a JSON array of strings. Example: ["Hey, love your work!", "Question about your rates?"]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          // Fix: Configure a responseSchema for more predictable JSON output.
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        }
      });

      // Fix: Use the .text property directly.
      const text = response.text;
      if (!text) return [];
      
      const json = JSON.parse(text);
      return Array.isArray(json) ? json : [];
    } catch (error) {
      console.error("Gemini Icebreaker Error:", error);
      return [
        `Hey ${matchName}, love your profile!`,
        `Hi! I saw you're interested in ${matchTags[0] || 'collaboration'}.`,
        "Would love to discuss a potential partnership."
      ];
    }
  },

  async identifyLocation(lat: number, lng: number): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Use gemini-2.5-flash for Maps Grounding support
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', 
        contents: "What is the specific City and State (or City and Country if outside US) for this location? Return ONLY the location string (e.g. 'San Francisco, CA'). Do not add any introduction or periods.",
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng
              }
            }
          }
        }
      });

      return response.text?.trim() || '';
    } catch (error) {
      console.error("Gemini Location Error:", error);
      return "";
    }
  }
};
