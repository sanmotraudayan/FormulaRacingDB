import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '380px'
    }}>
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--ink)',
              borderRadius: 'var(--radius)',
              padding: '12px 14px',
              boxShadow: '3px 3px 0 var(--ink)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            {isSuccess && <CheckCircle2 size={16} color="var(--ok)" style={{ flexShrink: 0, marginTop: '2px' }} />}
            {isError && <AlertTriangle size={16} color="var(--red)" style={{ flexShrink: 0, marginTop: '2px' }} />}
            {!isSuccess && !isError && <Info size={16} color="var(--ink-3)" style={{ flexShrink: 0, marginTop: '2px' }} />}

            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '12px',
                color: isSuccess ? 'var(--ok)' : isError ? 'var(--red)' : 'var(--ink)',
                textTransform: 'uppercase'
              }}>
                {toast.title || (isSuccess ? 'Success' : isError ? 'Error' : 'Notification')}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginTop: '2px', lineHeight: 1.3 }}>
                {toast.message}
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-3)',
                cursor: 'pointer',
                padding: '2px'
              }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
