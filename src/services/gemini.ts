import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface DesignAsset {
  strategy: string;
  imageUrl: string;
  captions: {
    instagram: {
      text: string;
      hashtags: string[];
    };
    facebook: {
      text: string;
      cta: string;
    };
    linkedin: {
      text: string;
      hashtags: string[];
    };
  };
}

export async function generateAsset(
  input: string, 
  subjectBase64?: string, 
  visualInstructions?: string, 
  logoBase64?: string,
  artStyle: string = 'Realistic',
  referenceBase64?: string
): Promise<DesignAsset> {
  if (!ai) throw new Error("Gemini API key not configured");

  // 1. Generate Design Strategy and Captions
  const textModel = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: `You are the "Instant Designer" engine. 
          Interpret the following input and create a design strategy and social media captions.
          
          POST OBJECTIVE: ${input}
          ART STYLE: ${artStyle}
          ${visualInstructions ? `VISUAL LOOK & FEEL: ${visualInstructions}` : ''}
          ${logoBase64 ? 'A brand logo has been provided. Incorporate its style/colors if appropriate.' : ''}
          ${subjectBase64 ? 'A subject/product image has been provided. This is the main focus of the ad.' : ''}
          ${referenceBase64 ? 'A reference post has been provided. Use its layout/composition as inspiration.' : ''}
          
          Return a JSON object with:
          - strategy: 1-sentence design strategy.
          - captions: { 
              instagram: { text: string, hashtags: string[] }, 
              facebook: { text: string, cta: string },
              linkedin: { text: string, hashtags: string[] }
            }
          ` },
          ...(subjectBase64 ? [{ inlineData: { data: subjectBase64, mimeType: "image/png" } }] : []),
          ...(referenceBase64 ? [{ inlineData: { data: referenceBase64, mimeType: "image/png" } }] : []),
          ...(logoBase64 ? [{ inlineData: { data: logoBase64, mimeType: "image/png" } }] : [])
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strategy: { type: Type.STRING },
          captions: {
            type: Type.OBJECT,
            properties: {
              instagram: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["text", "hashtags"]
              },
              facebook: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  cta: { type: Type.STRING }
                },
                required: ["text", "cta"]
              },
              linkedin: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["text", "hashtags"]
              }
            },
            required: ["instagram", "facebook", "linkedin"]
          }
        },
        required: ["strategy", "captions"]
      }
    }
  });

  const textResponse = await textModel;
  const designData = JSON.parse(textResponse.text || "{}");

  // 2. Generate Image
  const imageModel = ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          text: `You are a professional graphic designer. Create a high-quality social media ad based on the following:
          
          POST OBJECTIVE: ${input}
          ART STYLE: ${artStyle}
          VISUAL LOOK & FEEL: ${visualInstructions || 'Professional and modern'}
          DESIGN STRATEGY: ${designData.strategy}
          
          INSTRUCTIONS:
          1. SUBJECT IMAGE: If provided, this is the main product or person for the ad. Place it prominently.
          2. REFERENCE POST: If provided, mimic its layout, typography style, and overall composition.
          3. BRAND LOGO: If provided, you MUST incorporate this logo naturally into the design.
          4. ART STYLE: Strictly follow the ${artStyle} aesthetic.
          5. COMPOSITION: Professional, clean layout, and modern typography.
          6. TEXT: Include legible text overlays that match the post objective.`
        },
        ...(subjectBase64 ? [{ inlineData: { data: subjectBase64, mimeType: "image/png" } }] : []),
        ...(referenceBase64 ? [{ inlineData: { data: referenceBase64, mimeType: "image/png" } }] : []),
        ...(logoBase64 ? [{ inlineData: { data: logoBase64, mimeType: "image/png" } }] : [])
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      }
    }
  });

  const imageResponse = await imageModel;
  let imageUrl = "";
  for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  return {
    strategy: designData.strategy,
    imageUrl,
    captions: designData.captions
  };
}
