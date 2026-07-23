import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Light Theme Modal Card */}
      <div 
        className={`relative w-full ${sizeClasses[size]} bg-white border border-purple-100 rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all scale-100 opacity-100 duration-200 text-gray-900`}
        style={{ animation: 'scaleIn 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-purple-100 bg-purple-50/50">
          <h2 className="text-lg font-extrabold text-[#5B21B6] truncate pr-4">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-purple-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
