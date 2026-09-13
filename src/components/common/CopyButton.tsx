import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  className?: string;
  variant?: 'default' | 'subtle' | 'ghost' | 'icon';
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label = 'Copy',
  className = '',
  variant = 'default',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for non-secure contexts / iframes
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        id={`copy-btn-${Math.random().toString(36).substring(2, 7)}`}
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
        className={`p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors hover:bg-slate-800/80 active:scale-95 ${className}`}
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    );
  }

  const baseStyles = "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 active:scale-95";
  const variants = {
    default: copied 
      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
      : "bg-slate-800/90 text-slate-200 border border-slate-700/80 hover:bg-slate-750 hover:border-slate-600 hover:text-white",
    subtle: copied
      ? "text-emerald-400 bg-emerald-500/10"
      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
    ghost: copied
      ? "text-emerald-400"
      : "text-slate-400 hover:text-cyan-400",
  };

  return (
    <button
      type="button"
      id={`copy-btn-${Math.random().toString(36).substring(2, 7)}`}
      onClick={handleCopy}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-slate-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
