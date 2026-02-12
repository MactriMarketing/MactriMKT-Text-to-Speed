import { Gender, VoiceStyle, VoiceOption } from './types';

// Limit configuration
export const FREE_DAILY_LIMIT = 20;
export const MAX_CHARS = 5000;
export const LICENSE_KEY_PATTERN = /^VTS-[A-Z0-9]{8}$/; // Example pattern

// Mapping Gemini voices to Vietnamese Contexts
// Note: Gemini voices are multilingual but trained with specific personas.
// We map them to genders and roughly to styles/regions based on tone.
export const VOICE_OPTIONS: VoiceOption[] = [
  // Regions
  { id: 'Kore', name: 'Ngọc Mai', gender: Gender.FEMALE, style: VoiceStyle.NORTH }, // Clear, standard
  { id: 'Zephyr', name: 'Lan Anh', gender: Gender.FEMALE, style: VoiceStyle.SOUTH }, // Softer
  { id: 'Puck', name: 'Minh Quân', gender: Gender.MALE, style: VoiceStyle.NORTH }, // Deep, authoritative
  { id: 'Fenrir', name: 'Tuấn Hưng', gender: Gender.MALE, style: VoiceStyle.SOUTH }, // Slightly more dynamic
  { id: 'Charon', name: 'Quốc Khánh', gender: Gender.MALE, style: VoiceStyle.CENTRAL }, // Deep, can act as neutral/central

  // Styles (New additions)
  { id: 'Fenrir', name: 'MC Tuấn (Sôi động)', gender: Gender.MALE, style: VoiceStyle.ADS },
  { id: 'Kore', name: 'MC Mai (Hào hứng)', gender: Gender.FEMALE, style: VoiceStyle.ADS },
  { id: 'Zephyr', name: 'Thảo Review', gender: Gender.FEMALE, style: VoiceStyle.REVIEW },
  { id: 'Charon', name: 'Huy Review', gender: Gender.MALE, style: VoiceStyle.REVIEW },
  { id: 'Puck', name: 'Chú Ba (Trầm ấm)', gender: Gender.MALE, style: VoiceStyle.STORY },
  { id: 'Zephyr', name: 'Cô Út (Nhẹ nhàng)', gender: Gender.FEMALE, style: VoiceStyle.STORY },
];

export const INITIAL_SETTINGS = {
  dailyUsage: 0,
  lastUsedDate: new Date().toISOString().split('T')[0],
  licenseKey: '',
  isPro: false,
};