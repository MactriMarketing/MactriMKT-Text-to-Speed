import { GoogleGenAI, Modality } from "@google/genai";
import { pcmToWavBlob } from "./audioUtils";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

export interface GenerateSpeechResult {
  audioBlob: Blob;
  duration: number; // estimate
}

export const generateSpeech = async (
  text: string, 
  voiceName: string, 
  speed: number = 1.0
): Promise<GenerateSpeechResult> => {
  if (!text) throw new Error("Vui lòng nhập văn bản.");

  try {
    // Note: 'speed' isn't a direct parameter in the current public preview spec for gemini-2.5-flash-preview-tts
    // in the same way strictly as some other APIs, but we can try to influence it via system instructions 
    // or just accept the natural speed. For this implementation, we will pass the voice config.
    // If strict speed control is needed, it usually requires client-side post-processing or specific model flags
    // that might be experimental. We will focus on the Voice Name here.

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("Không nhận được dữ liệu âm thanh từ hệ thống.");
    }

    // Convert to WAV Blob
    // Gemini TTS usually defaults to 24kHz
    const audioBlob = pcmToWavBlob(base64Audio, 24000);
    
    // Estimate duration based on size (Size / ByteRate)
    // ByteRate = SampleRate * NumChannels * BytesPerSample
    // 24000 * 1 * 2 = 48000 bytes per second
    const duration = audioBlob.size / 48000;

    return { audioBlob, duration };

  } catch (error: any) {
    console.error("TTS API Error:", error);
    throw new Error(error.message || "Đã xảy ra lỗi khi tạo giọng nói.");
  }
};