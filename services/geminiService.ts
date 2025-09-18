
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Scene, ScenePayload } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        story: {
            type: Type.STRING,
            description: "The next part of the story in 1-2 paragraphs. Describe the scene, what is happening, and the results of the player's last action.",
        },
        imagePrompt: {
            type: Type.STRING,
            description: "A detailed, vivid prompt for an AI image generator to create a cinematic, photorealistic image of the scene. Describe the environment, lighting, and key objects. Style: cinematic, photorealistic, 8k, detailed, atmospheric, Mars setting.",
        },
        choices: {
            type: Type.ARRAY,
            description: "A list of 2 to 4 distinct and interesting actions the player can take next.",
            items: {
                type: Type.STRING,
            },
        },
        newItem: {
            type: Type.STRING,
            description: "An item the player found or acquired in this scene (e.g., 'Power Cell', 'Medkit'). If no item is found, return an empty string.",
        },
        gameOver: {
            type: Type.BOOLEAN,
            description: "Set to true ONLY if this is a definitive game over state (e.g., player death or reaching a final conclusion).",
        },
        habitatUpdate: {
            type: Type.OBJECT,
            nullable: true,
            description: "An object describing a new part to add to the Martian habitat. If no new part is added, this MUST be null.",
            properties: {
                partType: { type: Type.STRING, description: "The type of the part (e.g., 'CYLINDER', 'DOME', 'TUBE', 'AIRLOCK')." },
                position: {
                    type: Type.OBJECT,
                    properties: {
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        z: { type: Type.NUMBER },
                    },
                    required: ['x', 'y', 'z'],
                    description: "The 3D position of the new part relative to the habitat's origin."
                },
                rotation: {
                    type: Type.OBJECT,
                    properties: {
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        z: { type: Type.NUMBER },
                    },
                    required: ['x', 'y', 'z'],
                    description: "The 3D rotation of the new part in radians."
                },
                scale: {
                    type: Type.OBJECT,
                    properties: {
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        z: { type: Type.NUMBER },
                    },
                    required: ['x', 'y', 'z'],
                    description: "The 3D scale of the new part."
                }
            },
        },
    },
    required: ["story", "imagePrompt", "choices", "newItem", "gameOver", "habitatUpdate"],
};

const systemInstruction = `You are a master storyteller and game master for a text-based adventure game called 'Settlers of Mars'. The player is one of the first human colonists on Mars. Your goal is to create a compelling, branching narrative focused on survival, exploration, and mystery. The story must be engaging and suspenseful. The choices you provide should be meaningful and have consequences. If the player finds an item, describe how they find it in the story. The player is also building a Martian habitat, starting with their crashed lander (a large cylinder at position 0,0,0). Some choices should allow the player to expand their base with new modules like tubes, domes, and airlocks. When the player adds a part, describe it in the story and provide the 'habitatUpdate' object with its details. Be creative with the placement and orientation of new parts to build an interesting base over time. You must always respond in the provided JSON schema.`;

const generateStory = async (history: string, choice: string): Promise<ScenePayload> => {
    let content;
    if (!history) {
        content = "Start the game. The player's colonization shuttle has just crash-landed. They are the sole survivor amidst the wreckage on the red, dusty plains of Mars. The main cylindrical body of the shuttle seems mostly intact and could serve as a starting shelter. What is their first move?";
    } else {
        content = `Here is the story so far:\n${history}\n\nThe player chose to: "${choice}".\n\nContinue the story. What happens next?`;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: content,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.8,
        },
    });
    
    const text = response.text.trim();
    try {
        // Gemini with JSON schema sometimes wraps the output in markdown backticks
        const cleanText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        return JSON.parse(cleanText) as ScenePayload;
    } catch (e) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("Received an invalid story format from the AI.");
    }
};

const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `${prompt}, on the planet Mars, sci-fi, realistic`,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9',
        },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("Failed to generate an image.");
};

export const fetchNextScene = async (history: string, choice: string): Promise<Scene> => {
    const scenePayload = await generateStory(history, choice);
    const imageUrl = await generateImage(scenePayload.imagePrompt);

    return {
        ...scenePayload,
        imageUrl,
    };
};