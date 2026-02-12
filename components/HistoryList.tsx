import React from 'react';
import { HistoryItem } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
  onPlay: (url: string) => void;
  onDelete: (id: string) => void;
  currentAudioUrl: string | null;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onPlay, onDelete, currentAudioUrl }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Chưa có lịch sử chuyển đổi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((item) => (
        <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-medium text-gray-900 truncate">{item.text}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span>{new Date(item.timestamp).toLocaleString('vi-VN')}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{item.voiceName}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>~{Math.round(item.duration)}s</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {item.audioUrl && (
              <button
                onClick={() => onPlay(item.audioUrl!)}
                className={`p-2 rounded-full transition-colors ${
                  currentAudioUrl === item.audioUrl 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-gray-400 hover:bg-gray-100 hover:text-indigo-600'
                }`}
                title="Nghe lại"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
              title="Xóa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryList;