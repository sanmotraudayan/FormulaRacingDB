import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '540px' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 20, 26, 0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--ink)',
          borderRadius: 'var(--radius)',
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 4px 0 var(--ink)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '4px', height: '18px', background: 'var(--red)', borderRadius: '1px' }} />
            <h3 style={{ 
              fontSize: '17px', 
              color: 'var(--ink)', 
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}>
              {title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ width: '28px', height: '28px', border: '1px solid var(--line-strong)', background: 'var(--surface)' }}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
