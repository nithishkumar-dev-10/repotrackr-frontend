import React from 'react';
import { motion } from 'framer-motion';

export const SvgMiniGraphThumbnail: React.FC<{ status?: string }> = ({ status = 'ready' }) => {
  const statusColors: Record<string, string> = {
    ready: '#3B5BFF',
    indexing: '#F59E0B',
    added: '#64748B',
  };

  const primary = statusColors[status] || '#3B5BFF';

  const nodes = [
    { id: '1', cx: 35, cy: 35, r: 6, isEntry: true },
    { id: '2', cx: 105, cy: 25, r: 5, isEntry: false },
    { id: '3', cx: 75, cy: 60, r: 8, isEntry: true },
    { id: '4', cx: 145, cy: 55, r: 5, isEntry: false },
    { id: '5', cx: 45, cy: 90, r: 5, isEntry: false },
    { id: '6', cx: 115, cy: 95, r: 6, isEntry: false },
    { id: '7', cx: 180, cy: 80, r: 5, isEntry: false },
  ];

  const edges = [
    { x1: 35, y1: 35, x2: 105, y2: 25 },
    { x1: 35, y1: 35, x2: 75, y2: 60 },
    { x1: 75, y1: 60, x2: 145, y2: 55 },
    { x1: 75, y1: 60, x2: 45, y2: 90 },
    { x1: 75, y1: 60, x2: 115, y2: 95 },
    { x1: 145, y1: 55, x2: 180, y2: 80 },
    { x1: 115, y1: 95, x2: 180, y2: 80 },
  ];

  return (
    <div className="w-full h-28 rounded-xl bg-gradient-to-br from-[#F8FAFC] to-[#EDF2F7] border border-[#E2E8F0] p-3 flex items-center justify-center relative overflow-hidden group">
      <svg viewBox="0 0 210 120" className="w-full h-full">
        {/* Subtle grid */}
        <defs>
          <pattern id="miniGrid" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#CBD5E1" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#miniGrid)" />

        {/* Edges */}
        {edges.map((e, idx) => (
          <line
            key={idx}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        ))}

        {/* Active glowing path */}
        <motion.path
          d="M 35 35 L 75 60 L 115 95 L 180 80"
          fill="none"
          stroke={primary}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Nodes */}
        {nodes.map(n => (
          <g key={n.id}>
            {n.isEntry && (
              <circle
                cx={n.cx}
                cy={n.cy}
                r={n.r + 3.5}
                fill="none"
                stroke={primary}
                strokeWidth="1.2"
                strokeOpacity="0.5"
              />
            )}
            <circle
              cx={n.cx}
              cy={n.cy}
              r={n.r}
              fill={n.isEntry ? primary : '#64748B'}
              className="group-hover:scale-110 transition-transform origin-center"
            />
            <circle cx={n.cx} cy={n.cy} r={n.r * 0.4} fill="#FFFFFF" />
          </g>
        ))}
      </svg>
    </div>
  );
};
