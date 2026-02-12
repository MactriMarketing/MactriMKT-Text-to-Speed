import React, { useState, useEffect, useRef } from 'react';
import { generateSpeech } from './services/geminiService';
import { VOICE_OPTIONS, FREE_DAILY_LIMIT, MAX_CHARS, INITIAL_SETTINGS } from './constants';
import { Gender, VoiceStyle, VoiceOption, HistoryItem, UserSettings } from './types';
import LicenseModal from './components/LicenseModal';
import HistoryList from './components/HistoryList';

function App() {
  // State
  const [text, setText] = useState('');
  const [selectedGender, setSelectedGender] = useState<Gender>(Gender.FEMALE);
  const [selectedStyle, setSelectedStyle] = useState<VoiceStyle>(VoiceStyle.NORTH);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICE_OPTIONS[0]);
  const [speed, setSpeed] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load settings & history from LocalStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('tts_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedSettings = localStorage.getItem('tts_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Check for day reset
      const today = new Date().toISOString().split('T')[0];
      if (parsed.lastUsedDate !== today) {
        setUserSettings({ ...parsed, dailyUsage: 0, lastUsedDate: today });
      } else {
        setUserSettings(parsed);
      }
    } else {
      localStorage.setItem('tts_settings', JSON.stringify(INITIAL_SETTINGS));
    }
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('tts_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('tts_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  // Update voice selection when gender/style changes
  useEffect(() => {
    const found = VOICE_OPTIONS.find(v => v.gender === selectedGender && v.style === selectedStyle);
    if (found) {
      setSelectedVoice(found);
    } else {
      // Fallback if exact match not found (e.g. Female + Central might not exist)
      // First try to find same gender in other styles
      const fallback = VOICE_OPTIONS.find(v => v.gender === selectedGender) || VOICE_OPTIONS[0];
      setSelectedVoice(fallback);
    }
  }, [selectedGender, selectedStyle]);

  const handleGenerate = async () => {
    setErrorMsg(null);

    // Validations
    if (!text.trim()) {
      setErrorMsg("Vui lòng nhập nội dung văn bản.");
      return;
    }
    if (text.length > MAX_CHARS) {
      setErrorMsg(`Văn bản quá dài. Tối đa ${MAX_CHARS} ký tự.`);
      return;
    }
    if (!userSettings.isPro && userSettings.dailyUsage >= FREE_DAILY_LIMIT) {
      setErrorMsg("Bạn đã hết lượt dùng thử miễn phí hôm nay. Vui lòng nâng cấp.");
      setShowLicenseModal(true);
      return;
    }

    setIsLoading(true);
    setAudioUrl(null);

    try {
      const result = await generateSpeech(text, selectedVoice.id, speed);
      
      const newUrl = URL.createObjectURL(result.audioBlob);
      setAudioUrl(newUrl);

      // Update History
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        timestamp: Date.now(),
        duration: result.duration,
        voiceName: selectedVoice.name,
        audioUrl: newUrl
      };
      setHistory(prev => [newItem, ...prev]);

      // Update Usage
      setUserSettings(prev => ({
        ...prev,
        dailyUsage: prev.dailyUsage + 1
      }));

    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi không xác định khi tạo giọng nói.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
  };

  const handleActivate = (key: string) => {
    setUserSettings(prev => ({
      ...prev,
      licenseKey: key,
      isPro: true
    }));
    alert("Kích hoạt thành công! Bạn có thể sử dụng không giới hạn.");
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
              V
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">VietVoice Studio</h1>
              <p className="text-xs text-gray-500 mt-1">Chuyển văn bản thành giọng nói</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-gray-600">
               Lượt dùng: <span className={`font-bold ${userSettings.isPro ? 'text-green-600' : 'text-indigo-600'}`}>
                {userSettings.isPro ? 'Không giới hạn' : `${userSettings.dailyUsage}/${FREE_DAILY_LIMIT}`}
               </span>
            </div>
            {!userSettings.isPro && (
              <button 
                onClick={() => setShowLicenseModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all"
              >
                Nâng cấp Pro
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Controls & Input */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Toolbar */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                 {/* Gender Select */}
                <select 
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value as Gender)}
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                >
                  <option value={Gender.FEMALE}>Giọng Nữ</option>
                  <option value={Gender.MALE}>Giọng Nam</option>
                </select>

                {/* Style/Region Select */}
                <select 
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value as VoiceStyle)}
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                >
                  <optgroup label="Vùng miền">
                    <option value={VoiceStyle.NORTH}>Miền Bắc</option>
                    <option value={VoiceStyle.CENTRAL}>Miền Trung</option>
                    <option value={VoiceStyle.SOUTH}>Miền Nam</option>
                  </optgroup>
                  <optgroup label="Phong cách đặc biệt">
                    <option value={VoiceStyle.ADS}>Quảng cáo</option>
                    <option value={VoiceStyle.REVIEW}>Review</option>
                    <option value={VoiceStyle.STORY}>Kể chuyện</option>
                  </optgroup>
                </select>
              </div>

              {/* Speed Control */}
              <div className="flex items-center gap-3">
                 <span className="text-sm text-gray-600 font-medium">Tốc độ: {speed}x</span>
                 <input 
                   type="range" 
                   min="0.5" 
                   max="1.5" 
                   step="0.25"
                   value={speed}
                   onChange={(e) => setSpeed(parseFloat(e.target.value))}
                   className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                 />
              </div>
            </div>

            {/* Text Input Area */}
            <div className="p-6">
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Nhập hoặc dán văn bản tiếng Việt vào đây..."
                  className="w-full h-64 p-4 text-gray-800 text-lg leading-relaxed border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all resize-y outline-none"
                ></textarea>
                
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${text.length > MAX_CHARS ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    {text.length} / {MAX_CHARS}
                  </span>
                  <button 
                    onClick={handleCopyText}
                    className="p-2 text-gray-400 hover:text-indigo-600 bg-white shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-all"
                    title="Sao chép"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errorMsg}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></span>
                   <span className="text-sm text-gray-600">Giọng đọc: <span className="font-semibold">{selectedVoice.name}</span></span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transform transition-all ${
                    isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1'
                  } flex items-center gap-2`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Chuyển thành giọng nói
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Audio Player Card (Sticky only if audio present) */}
          {audioUrl && (
            <div className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-2xl p-6 shadow-xl text-white transform transition-all animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-indigo-100">Kết quả âm thanh</h3>
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-indigo-100">WAV • High Quality</span>
              </div>
              
              <audio 
                ref={audioRef} 
                src={audioUrl} 
                controls 
                className="w-full mb-4 accent-indigo-500" 
                autoPlay
              />

              <div className="flex justify-end">
                <a 
                  href={audioUrl} 
                  download={`vietvoice_${Date.now()}.wav`}
                  className="px-6 py-2 bg-white text-indigo-900 font-bold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Tải file Audio
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: History & Tips */}
        <div className="space-y-6">
           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-[calc(100vh-8rem)] sticky top-28 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Lịch sử gần đây</h2>
                <button 
                  onClick={() => {
                     setHistory([]);
                     setAudioUrl(null);
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Xóa tất cả
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                <HistoryList 
                  history={history} 
                  onPlay={(url) => setAudioUrl(url)}
                  onDelete={deleteHistoryItem}
                  currentAudioUrl={audioUrl}
                />
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="bg-indigo-50 rounded-xl p-4">
                  <h4 className="font-bold text-indigo-900 text-sm mb-2">Mẹo sử dụng</h4>
                  <ul className="text-xs text-indigo-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      Sử dụng dấu phẩy (,) để ngắt nghỉ ngắn.
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      Dùng dấu chấm (.) để ngắt nghỉ dài hơn.
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      Nhập mã <strong>VIP-MEMBER-2024</strong> để dùng thử bản Pro.
                    </li>
                  </ul>
                </div>
              </div>
           </div>
        </div>

      </main>

      <LicenseModal 
        isOpen={showLicenseModal} 
        onClose={() => setShowLicenseModal(false)} 
        onActivate={handleActivate}
      />
    </div>
  );
}

export default App;