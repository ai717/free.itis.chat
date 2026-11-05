import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import type { SafeguardStatus } from '../types';
import { useCurrentLang } from '../utils/i18n';

interface SafeguardBadgeProps {
  status: SafeguardStatus;
  warningText: string;
}

export const SafeguardBadge: React.FC<SafeguardBadgeProps> = ({ status, warningText }) => {
  const [lang] = useCurrentLang();
  const [showTooltip, setShowTooltip] = useState(false);
  const isEn = lang === 'en';

  const config = {
    verified: {
      label: isEn ? 'Verified' : '社区验证',
      sublabel: isEn ? 'Clean & Safe' : '纯净无套路',
      icon: ShieldCheck,
      bgColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      tooltipBg: 'border-emerald-500/30 shadow-emerald-950/50',
    },
    warning: {
      label: isEn ? 'Caution' : '避坑提示',
      sublabel: isEn ? 'Has Caveats' : '含注意事项',
      icon: AlertTriangle,
      bgColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
      iconColor: 'text-amber-400',
      tooltipBg: 'border-amber-500/30 shadow-amber-950/50',
    },
    danger: {
      label: isEn ? 'High Risk' : '高危提示',
      sublabel: isEn ? 'Proceed with care' : '需谨慎操作',
      icon: AlertOctagon,
      bgColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20',
      iconColor: 'text-rose-400',
      tooltipBg: 'border-rose-500/30 shadow-rose-950/50',
    },
  }[status] || {
    label: isEn ? 'Verified' : '社区验证',
    sublabel: isEn ? 'Clean' : '纯净',
    icon: ShieldCheck,
    bgColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    iconColor: 'text-emerald-400',
    tooltipBg: 'border-emerald-500/30',
  };

  const Icon = config.icon;

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-help ${config.bgColor}`}
      >
        <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
        <span>{config.label}</span>
      </div>

      {showTooltip && (
        <div
          role="tooltip"
          className={`absolute left-0 bottom-full mb-2 z-50 w-64 p-3 rounded-xl bg-[#0d1527] border ${config.tooltipBg} shadow-2xl backdrop-blur-xl text-xs text-slate-200 pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95`}
        >
          <div className="flex items-center gap-1.5 font-semibold mb-1 text-slate-100">
            <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
            <span>{isEn ? 'Caveats & Safe Guidance' : '避坑与安全指引'}</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">{warningText}</p>
          <div className="absolute left-4 top-full w-2 h-2 bg-[#0d1527] border-b border-r border-slate-700/50 transform rotate-45 -translate-y-1"></div>
        </div>
      )}
    </div>
  );
};
