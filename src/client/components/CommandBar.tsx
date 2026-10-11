import React, { useState, useEffect } from 'react';
import { Search, Compass, CheckCircle2, Box, Sparkles, X, ArrowRight } from 'lucide-react';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onRunQuery: (query: string, mode?: 'reader' | 'plan' | 'context') => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({ isOpen, onClose, onRunQuery }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent will toggle
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickSuggestions = [
    {
      icon: Compass,
      mode: 'reader' as const,
      color: '#3B5BFF',
      title: 'Where do I start reading this codebase?',
      desc: 'Reader Mode • Guided file:line onboarding order',
    },
    {
      icon: CheckCircle2,
      mode: 'plan' as const,
      color: '#16A34A',
      title: 'Verify roadmap milestones and implementation status',
      desc: 'Plan Verifier • Done/Partial/Missing audit with evidence beams',
    },
    {
      icon: Box,
      mode: 'context' as const,
      color: '#F59E0B',
      title: 'Pack context for adding a new rate limiter endpoint',
      desc: 'Context Packer • Budget-aware full & signature tiers',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onRunQuery(query.trim());
    onClose();
    setQuery('');
  };

  const handlePickSuggestion = (promptText: string, mode: 'reader' | 'plan' | 'context') => {
    onRunQuery(promptText, mode);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E4E7EF] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex items-center px-4 py-3.5 border-b border-[#E4E7EF] gap-3">
          <Search className="w-5 h-5 text-[#5B6478]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask anything about the architecture, or search symbol / file..."
            className="flex-1 bg-transparent text-[#0B1020] text-sm focus:outline-none placeholder-[#94A3B8]"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#5B6478] hover:bg-[#F6F7FB] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 bg-[#F6F7FB]">
          <div className="px-2 py-1.5 text-[11px] font-bold text-[#5B6478] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#3B5BFF]" />
            Recommended Prompts
          </div>
          <div className="space-y-1.5 mt-1">
            {quickSuggestions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handlePickSuggestion(item.title, item.mode)}
                  className="w-full text-left p-3 rounded-xl bg-white hover:bg-[#E8ECFF]/50 border border-[#E4E7EF] hover:border-[#3B5BFF]/30 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#0B1020] group-hover:text-[#3B5BFF] transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#5B6478] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#3B5BFF] group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 py-2.5 bg-white border-t border-[#E4E7EF] flex items-center justify-between text-[11px] text-[#5B6478]">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[#F6F7FB] border border-[#E4E7EF] font-mono text-[10px]">Enter</kbd> to search</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#F6F7FB] border border-[#E4E7EF] font-mono text-[10px]">Esc</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
};
