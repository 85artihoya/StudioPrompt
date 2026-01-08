
import { GoogleGenAI, Type } from "@google/genai";
import { PromptSection } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeImageForPrompt = async (base64Image: string): Promise<PromptSection> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this cinematic or movie-style image and extract details into the following 8-part structured format for an image generation prompt:
    
    1. Purpose: Core goal and shot type (e.g., BTS selfie, long shot).
    2.1 User Character: Describe the first person (usually the reference).
    2.2 Target Character: Describe the second person (actor/character).
    2.3 Interaction: How they are posing or relating to each other.
    3. Environment: The background and set details.
    4. Lighting: Light source and color tone.
    5. Style: Rendering quality and photographic nature.
    6. Negative: What to avoid.

    Return ONLY a JSON object with keys: purpose, userPerson, targetCharacter, interaction, environment, lighting, style, negative.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          purpose: { type: Type.STRING },
          userPerson: { type: Type.STRING },
          targetCharacter: { type: Type.STRING },
          interaction: { type: Type.STRING },
          environment: { type: Type.STRING },
          lighting: { type: Type.STRING },
          style: { type: Type.STRING },
          negative: { type: Type.STRING }
        },
        required: ["purpose", "userPerson", "targetCharacter", "interaction", "environment", "lighting", "style", "negative"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const parseStructuredPrompt = async (rawPrompt: string): Promise<{ prompt: PromptSection, title: string }> => {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `You are an expert prompt engineer. Your task is to take a raw image generation prompt and decompose it into a specific 8-part structure. 
  Additionally, generate a short, catchy, and descriptive title for this template (e.g., "Neon Noir Alleyway" or "Victorian BTS Selfie").
  
  Structure keys:
  - purpose: The core goal, shot type, and composition.
  - userPerson: Description of the main human subject (Subject A).
  - targetCharacter: Description of the secondary/target character (Subject B).
  - interaction: How the subjects are interacting or posing together.
  - environment: The setting, background, and props.
  - lighting: The light quality, sources, and atmospheric effects.
  - style: Artistic style, camera settings, and rendering quality.
  - negative: Things to exclude.

  If a part is missing from the input, provide a reasonable default based on the context. Return ONLY valid JSON.`;

  const response = await ai.models.generateContent({
    model,
    contents: `Please parse this prompt into the structured format and suggest a title: "${rawPrompt}"`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A creative and relevant title for the template." },
          prompt: {
            type: Type.OBJECT,
            properties: {
              purpose: { type: Type.STRING },
              userPerson: { type: Type.STRING },
              targetCharacter: { type: Type.STRING },
              interaction: { type: Type.STRING },
              environment: { type: Type.STRING },
              lighting: { type: Type.STRING },
              style: { type: Type.STRING },
              negative: { type: Type.STRING }
            },
            required: ["purpose", "userPerson", "targetCharacter", "interaction", "environment", "lighting", "style", "negative"]
          }
        },
        required: ["title", "prompt"]
      }
    }
  });
  
  return JSON.parse(response.text || "{}");
};

export const optimizePrompt = async (currentPrompt: PromptSection): Promise<PromptSection> => {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: `Refine and improve this cinematic image prompt for better realism and detail. Maintain the 8-part structure. Current prompt: ${JSON.stringify(currentPrompt)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          purpose: { type: Type.STRING },
          userPerson: { type: Type.STRING },
          targetCharacter: { type: Type.STRING },
          interaction: { type: Type.STRING },
          environment: { type: Type.STRING },
          lighting: { type: Type.STRING },
          style: { type: Type.STRING },
          negative: { type: Type.STRING }
        }
      }
    }
  });
  
  return JSON.parse(response.text || "{}");
};
