
import { GoogleGenAI, Type } from "@google/genai";
import { User, UserRole } from '../types';

export const geminiService = {
  async generateBio(user: User, tone: string = 'Professional'): Promise<string> {
    try {
      // Fix: Always initialize GoogleGenAI inside the method to ensure it uses the most up-to-date API key.
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
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
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
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
    // 1. Try Gemini with Google Maps Grounding
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      // Use gemini-2.5-flash for Maps Grounding support
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Identify the City and State for these coordinates. If the location is in India, format it strictly as 'City, State' (e.g. 'Mumbai, Maharashtra'). Do NOT include the country name if it is India. If it is outside India, include the Country. Return ONLY the location string.",
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

      const location = response.text?.trim();
      if (location) return location;
    } catch (error) {
      console.error("Gemini Location Error:", error);
    }

    // 2. Fallback to OpenStreetMap (Nominatim)
    try {
      console.log("Using location fallback...");
      // Zoom 12 usually gives enough detail for city/suburb
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`);
      const data = await res.json();
      const address = data.address;

      if (address) {
        const countryCode = address.country_code?.toLowerCase();

        // Priority logic for India
        if (countryCode === 'in') {
          const city = address.city || address.town || address.village || address.municipality || address.city_district || address.district;
          const state = address.state || address.state_district || address.region;

          if (city && state) {
            return `${city}, ${state}`;
          }
          if (city) return city;
          if (state) return state;
        }

        // General Fallback
        const city = address.city || address.town || address.village || address.county;
        const country = address.country;

        if (city && country) return `${city}, ${country}`;
        if (data.display_name) {
          const parts = data.display_name.split(',');
          return `${parts[0].trim()}, ${parts[1]?.trim() || ''}`;
        }
      }
    } catch (e) {
      console.error("Fallback location failed", e);
    }

    return "Location Unavailable";
  },

  async generateMatchReason(userA: User, userB: User): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = `Explain why these two profiles on a professional networking app (Ping) are a perfect match.
      User 1 (${userA.role}): Name: ${userA.name}, Tags: ${userA.tags.join(', ')}, Bio: ${userA.bio}
      User 2 (${userB.role}): Name: ${userB.name}, Tags: ${userB.tags.join(', ')}, Bio: ${userB.bio}
      
      Requirements:
      - Max 15 words.
      - Punchy, professional, and personalized.
      - Focus on shared interests or complementary roles.
      - Format: "X% Match: [Reason]" where X is a logical percentage between 85-99.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
      });

      return response.text?.trim() || `${Math.floor(Math.random() * 15) + 85}% Match: Complementary skills and shared niche.`;
    } catch (error) {
      console.error("Gemini Match Reason Error:", error);
      return `${Math.floor(Math.random() * 15) + 85}% Match: Complementary skills and shared niche.`;
    }
  },

  async optimizeProfile(user: User): Promise<{ bio: string; tags: string[] }> {
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = `Optimize this ${user.role} profile for a networking app called Ping.
      Name: ${user.name}
      Current Bio: ${user.bio}
      Current Tags: ${user.tags.join(', ')}
      Role Details: ${user.role === UserRole.BUSINESS ? `Industry: ${user.industry}` : `Job: ${user.jobTitle}`}
      
      Output strictly as a JSON object with:
      - bio: A short, high-conversion bio (max 200 chars)
      - tags: 5-7 highly relevant keywords for discovery
      
      Example: {"bio": "...", "tags": ["tag1", "tag2"]}`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bio: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['bio', 'tags']
          }
        }
      });

      const json = JSON.parse(response.text);
      return {
        bio: json.bio || user.bio || '',
        tags: json.tags || user.tags
      };
    } catch (error) {
      console.error("Gemini Optimization Error:", error);
      return { bio: user.bio || '', tags: user.tags };
    }
  },

  async moderateMedia(file: File): Promise<{ isSafe: boolean; reason?: string }> {
    try {
      // Limit file size for in-browser base64 conversion to avoid OOM (e.g. 5MB)
      // If it's a large video, we'll bypass full moderation for this demo
      if (file.size > 5 * 1024 * 1024 && file.type.startsWith('video/')) {
        console.warn("Video too large for inline AI moderation. Bypassing.");
        return { isSafe: true };
      }

      // Convert file to base64 inline data using FileReader (safe for large files)
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = error => reject(error);
      });

      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = `Analyze this media carefully. 
      Is it safe for a professional networking platform? 
      Check for: NSFW content, excessive violence, illegal acts, or extremely low visual quality/spam.
      
      Output exactly a JSON object: 
      { "isSafe": boolean, "reason": "string explaining why if unsafe, or empty string if safe" }`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          prompt,
          { inlineData: { data: base64String, mimeType: file.type } }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isSafe: { type: Type.BOOLEAN },
              reason: { type: Type.STRING }
            },
            required: ['isSafe', 'reason']
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      return {
        isSafe: result.isSafe ?? true,
        reason: result.reason || ''
      };
    } catch (error) {
      console.error("Gemini Content Guard Error:", error);
      // Fail open so we don't block uploads unexpectedly
      return { isSafe: true };
    }
  }
};
