export enum Gender {
  MALE = 'Nam',
  FEMALE = 'Nữ'
}

export enum VoiceStyle {
  NORTH = 'Miền Bắc',
  CENTRAL = 'Miền Trung',
  SOUTH = 'Miền Nam',
  ADS = 'Quảng cáo',
  REVIEW = 'Review',
  STORY = 'Kể chuyện'
}

export interface VoiceOption {
  id: string; // Gemini voice name (Puck, Kore, etc.)
  name: string; // Display name
  gender: Gender;
  style: VoiceStyle; // Mapped approximation
}

export interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
  duration: number; // in seconds (estimated)
  voiceName: string;
  audioUrl?: string; // Blob URL
}

export interface UserSettings {
  dailyUsage: number;
  lastUsedDate: string; // YYYY-MM-DD
  licenseKey: string;
  isPro: boolean;
}