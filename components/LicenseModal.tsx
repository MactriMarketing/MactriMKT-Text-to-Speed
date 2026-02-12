import React, { useState } from 'react';
import { LICENSE_KEY_PATTERN } from '../constants';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate: (key: string) => void;
}

const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose, onActivate }) => {
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate validation
    if (keyInput === 'VIP-MEMBER-2024' || keyInput.length > 5) {
        onActivate(keyInput);
        onClose();
        setKeyInput('');
        setError('');
    } else {
        setError('Mã kích hoạt không hợp lệ. Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="bg-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Nâng cấp tài khoản</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Nhập mã kích hoạt để mở khóa không giới hạn số lần tạo giọng nói và các tính năng cao cấp.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">License Key</label>
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                placeholder="VTS-XXXXXXXX"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-sm"
              >
                Kích hoạt
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LicenseModal;