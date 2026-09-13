import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface DisclaimerBoxProps {
  text: string;
  type?: 'warning' | 'info';
  title?: string;
  className?: string;
}

export const DisclaimerBox: React.FC<DisclaimerBoxProps> = ({
  text,
  type = 'warning',
  title,
  className = '',
}) => {
  const isWarning = type === 'warning';

  return (
    <div
      className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
        isWarning
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200/90'
          : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200/90'
      } ${className}`}
    >
      {isWarning ? (
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      ) : (
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
      )}
      <div className="space-y-0.5">
        {title && <div className="font-semibold uppercase tracking-wider text-[11px] opacity-90">{title}</div>}
        <div>{text}</div>
      </div>
    </div>
  );
};
