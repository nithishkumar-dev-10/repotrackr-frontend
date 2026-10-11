import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const SvgNetworkIllustration: React.FC<{
  title?: string;
  subtitle?: string;
}> = ({
  title = 'Deterministic Code Intelligence',
  subtitle = 'Static analysis extracts real AST symbols and dependencies without guessing.',
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMousePos({ x, y });
  };

  const nodes = [
    { id: 'app', label: 'app.main', x: 260, y: 80, r: 16, color: '#3B5BFF', isEntry: true },
    { id: 'auth', label: 'auth.router', x: 140, y: 170, r: 13, color: '#6366F1', isEntry: false },
    { id: 'repos', label: 'repos.router', x: 380, y: 170, r: 14, color: '#3B5BFF', isEntry: false },
    { id: 'orch', label: 'orchestrator', x: 260, y: 250, r: 18, color: '#0EA5E9', isEntry: true },
    { id: 'ast', label: 'ast_visitor', x: 120, y: 340, r: 13, color: '#10B981', isEntry: false },
    { id: 'graph', label: 'code_graph', x: 260, y: 360, r: 15, color: '#8B5CF6', isEntry: false },
    { id: 'index', label: 'evidence_idx', x: 400, y: 340, r: 14, color: '#F59E0B', isEntry: false },
    { id: 'reason', label: 'ai_reasoner', x: 260, y: 450, r: 14, color: '#EC4899', isEntry: false },
  ];

  const edges = [
    { from: 'app', to: 'auth' },
    { from: 'app', to: 'repos' },
    { from: 'app', to: 'orch' },
    { from: 'orch', to: 'ast' },
    { from: 'orch', to: 'graph' },
    { from: 'orch', to: 'index' },
    { from: 'ast', to: 'graph' },
    { from: 'graph', to: 'index' },
    { from: 'index', to: 'reason' },
    { from: 'graph', to: 'reason' },
  ];

  return (
    <div
      onMouseMove={handleMouseMove}
      className="w-full h-full rounded-3xl bg-gradient-to-br from-[#F0F3FF] via-[#F8FAFC] to-[#EEF2F6] border border-[#E2E8F0] shadow-sm relative overflow-hidden flex flex-col justify-between p-8"
    >
      {/* Background Dot Matrix */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Interactive 2D Network */}
      <motion.div
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="relative flex-1 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 520 520"
          className="w-full max-w-[440px] h-auto drop-shadow-sm select-none"
        >
          <defs>
            <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B5BFF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.4" />
            </linearGradient>
            <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Edges */}
          {edges.map((e, idx) => {
            const src = nodes.find(n => n.id === e.from)!;
            const dst = nodes.find(n => n.id === e.to)!;
            return (
              <g key={idx}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <motion.line
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  stroke="url(#edgeGlow)"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: [0, 1, 1, 0],
                    opacity: [0, 0.8, 0.8, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: idx * 0.35,
                    ease: 'easeInOut',
                  }}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(n => (
            <motion.g
              key={n.id}
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 3 + (n.x % 4),
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Outer ring for entry points */}
              {n.isEntry && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r + 6}
                  fill="none"
                  stroke={n.color}
                  strokeWidth="1.5"
                  strokeOpacity="0.4"
                  strokeDasharray="3 3"
                />
              )}

              {/* Node body */}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={n.color}
                className="transition-transform hover:scale-110"
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r * 0.4}
                fill="#FFFFFF"
                opacity="0.9"
              />

              {/* Label */}
              <text
                x={n.x}
                y={n.y + n.r + 14}
                textAnchor="middle"
                className="text-[10px] font-mono font-semibold fill-[#475569] pointer-events-none"
              >
                {n.label}
              </text>
            </motion.g>
          ))}
        </svg>
      </motion.div>

      {/* Caption footer */}
      <div className="bg-white/80 backdrop-blur-md border border-[#E2E8F0] p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#3B5BFF] font-bold">
            AST Dependency Graph
          </span>
        </div>
        <h4 className="text-sm font-bold text-[#0F172A]">{title}</h4>
        <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
};
