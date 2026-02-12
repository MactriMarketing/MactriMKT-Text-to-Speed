/**
 * Decodes a base64 string to a Uint8Array.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Creates a WAV file header.
 */
function createWavHeader(dataLength: number, sampleRate: number, numChannels: number, bitsPerSample: number): Uint8Array {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true); // File size - 8
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // ByteRate
  view.setUint16(32, numChannels * (bitsPerSample / 8), true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true); // Subchunk2Size

  return new Uint8Array(header);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Converts raw PCM data (from Gemini) to a WAV Blob.
 * Gemini 2.5 TTS output is typically 24kHz mono (needs verification, standardizing on 24000).
 */
export function pcmToWavBlob(base64Pcm: string, sampleRate: number = 24000): Blob {
  const pcmData = base64ToUint8Array(base64Pcm);
  
  // Create WAV Header
  // Gemini sends raw bytes. Assuming 16-bit PCM for the raw output usually.
  // Actually the raw output from `inlineData` in Gemini TTS is typically raw PCM.
  // We need to ensure we wrap it correctly.
  
  const numChannels = 1;
  const bitsPerSample = 16; 
  
  const header = createWavHeader(pcmData.length, sampleRate, numChannels, bitsPerSample);
  
  // Combine header and data
  const wavBytes = new Uint8Array(header.length + pcmData.length);
  wavBytes.set(header);
  wavBytes.set(pcmData, header.length);

  return new Blob([wavBytes], { type: 'audio/wav' });
}