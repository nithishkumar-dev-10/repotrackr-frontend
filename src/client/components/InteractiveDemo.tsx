import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, CheckCircle2, Box, Sparkles, Code2, ArrowRight, CornerDownLeft } from 'lucide-react';

interface CitationItem {
  file: string;
  line: number;
  symbol: string;
  code: string;
}

interface DemoModeConfig {
  mode: 'reader' | 'plan' | 'context';
  chipLabel: string;
  query: string;
  badge: string;
  summary: string;
  citations: CitationItem[];
  activeNodeIds: string[];
  pathD: string;
}

const DEMO_CONFIGS: Record<'reader' | 'plan' | 'context', DemoModeConfig> = {
  reader: {
    mode: 'reader',
    chipLabel: 'Where do I start reading?',
    query: 'Where do I start reading this repo?',
    badge: 'Reader Mode',
    summary:
      'Execution starts at the application factory in app/main.py:34 where settings, CORS, and slowapi limiters initialize. Ingestion routes map incoming GitHub links in app/features/repos/router.py:21, and file:line evidence anchors are deterministically indexed in app/pipeline/indexer/store.py:30.',
    citations: [
      {
        file: 'app/main.py',
        line: 34,
        symbol: 'create_app()',
        code: 'def create_app() -> FastAPI:\n    settings = get_settings()\n    app = FastAPI(title=settings.APP_NAME)\n    app.include_router(auth_router)\n    return app',
      },
      {
        file: 'app/features/repos/router.py',
        line: 21,
        symbol: 'create_repo()',
        code: '@router.post("", response_model=RepoOut)\ndef create_repo(payload: RepoCreate):\n    owner, name = parse_github_url(payload.url)\n    return db.create(...)',
      },
      {
        file: 'app/pipeline/indexer/store.py',
        line: 30,
        symbol: 'EvidenceIndex',
        code: 'class EvidenceIndex:\n    def get_citation(self, symbol_id: str):\n        return Citation(file=..., line=...)',
      },
    ],
    activeNodeIds: ['entry', 'router', 'indexer'],
    pathD: 'M 60 55 L 140 120 L 180 190',
  },
  plan: {
    mode: 'plan',
    chipLabel: 'What is left in my plan?',
    query: 'What is left in my plan?',
    badge: 'Plan Verifier',
    summary:
      'Roadmap audit complete: Auth & JWT are fully verified in app/features/auth/router.py:53. Dependency graph compilation is partial in app/pipeline/graph/builder.py:35, while containerized git sandboxing remains missing in app/features/indexing/router.py:9.',
    citations: [
      {
        file: 'app/features/auth/router.py',
        line: 53,
        symbol: 'auth_router (Done)',
        code: 'router = APIRouter(prefix="/auth")\n# 100% verified against unit tests',
      },
      {
        file: 'app/pipeline/graph/builder.py',
        line: 35,
        symbol: 'CodeGraph (Partial)',
        code: 'class CodeGraph:\n    # PageRank live; Louvain partition in progress',
      },
      {
        file: 'app/features/indexing/router.py',
        line: 9,
        symbol: 'sandbox_stub (Missing)',
        code: '@router.post("/index")\ndef start_index():\n    return {"status": "not_implemented"}',
      },
    ],
    activeNodeIds: ['auth', 'graph', 'sandbox'],
    pathD: 'M 200 40 L 240 110 L 290 185',
  },
  context: {
    mode: 'context',
    chipLabel: 'I want to add rate limiting',
    query: 'I want to add rate limiting',
    badge: 'Context Packer',
    summary:
      'Packed 1,420 tokens against a 2,048 budget. Full tier bodies: Limiter instance configuration in app/core/ratelimit.py:12 and target router endpoint in app/features/repos/router.py:14. Signature tier: ownership validation dependencies.',
    citations: [
      {
        file: 'app/core/ratelimit.py',
        line: 12,
        symbol: 'limiter',
        code: 'limiter = Limiter(key_func=get_remote_address)\n# Ready for route decoration',
      },
      {
        file: 'app/features/repos/router.py',
        line: 14,
        symbol: 'repos_router',
        code: '@router.post("")\n@limiter.limit("5/minute")\ndef create_repo(...):',
      },
    ],
    activeNodeIds: ['ratelimit', 'router'],
    pathD: 'M 75 190 L 140 120',
  },
};

const MODE_KEYS: Array<'reader' | 'plan' | 'context'> = ['reader', 'plan', 'context'];

export const InteractiveDemo: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'reader' | 'plan' | 'context'>('reader');
  const [typedQuery, setTypedQuery] = useState('');
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [isAnswerTyping, setIsAnswerTyping] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [hoveredCitation, setHoveredCitation] = useState<CitationItem | null>(null);

  const cfg = DEMO_CONFIGS[activeMode];

  // Self-typing loop for the query input
  useEffect(() => {
    let queryCharIdx = 0;
    const targetQuery = cfg.query;
    setTypedQuery('');

    const queryInterval = setInterval(() => {
      if (queryCharIdx < targetQuery.length) {
        setTypedQuery(targetQuery.slice(0, queryCharIdx + 1));
        queryCharIdx++;
      } else {
        clearInterval(queryInterval);
      }
    }, 32);

    return () => clearInterval(queryInterval);
  }, [activeMode]);

  // Stream answer word-by-word once query finishes or changes
  useEffect(() => {
    setIsAnswerTyping(true);
    setDisplayedAnswer('');
    const words = cfg.summary.split(' ');
    let wordIdx = 0;

    const answerTimer = setTimeout(() => {
      const answerInterval = setInterval(() => {
        if (wordIdx < words.length) {
          setDisplayedAnswer(prev => (prev ? prev + ' ' + words[wordIdx] : words[wordIdx]));
          wordIdx++;
        } else {
          setIsAnswerTyping(false);
          clearInterval(answerInterval);
        }
      }, 30);

      return () => clearInterval(answerInterval);
    }, 450);

    return () => clearTimeout(answerTimer);
  }, [activeMode]);

  // Auto-cycle through queries if user hasn't explicitly interacted
  useEffect(() => {
    if (userInteracted) return;

    const cycleTimeout = setTimeout(() => {
      const nextIdx = (MODE_KEYS.indexOf(activeMode) + 1) % MODE_KEYS.length;
      setActiveMode(MODE_KEYS[nextIdx]);
    }, 9000);

    return () => clearTimeout(cycleTimeout);
  }, [activeMode, userInteracted]);

  const handleSelectMode = (mode: 'reader' | 'plan' | 'context') => {
    setUserInteracted(true);
    setActiveMode(mode);
  };

  // 2D SVG Graph Data
  const svgNodes = [
    { id: 'entry', label: 'app.main', step: '1', x: 60, y: 55, r: 15, color: '#3B5BFF', isEntry: true },
    { id: 'auth', label: 'auth.router', step: null, x: 200, y: 40, r: 13, color: '#16A34A', isEntry: false },
    { id: 'router', label: 'repos.router', step: '2', x: 140, y: 120, r: 14, color: '#3B5BFF', isEntry: false },
    { id: 'graph', label: 'code_graph', step: null, x: 240, y: 110, r: 13, color: '#F59E0B', isEntry: false },
    { id: 'indexer', label: 'evidence_idx', step: '3', x: 180, y: 190, r: 14, color: '#0EA5E9', isEntry: false },
    { id: 'ratelimit', label: 'ratelimit', step: null, x: 75, y: 190, r: 13, color: '#38BDF8', isEntry: false },
    { id: 'sandbox', label: 'git_sandbox', step: null, x: 290, y: 185, r: 13, color: '#EF4444', isEntry: false },
  ];

  const svgEdges = [
    { from: 'entry', to: 'auth' },
    { from: 'entry', to: 'router' },
    { from: 'router', to: 'graph' },
    { from: 'router', to: 'indexer' },
    { from: 'router', to: 'ratelimit' },
    { from: 'graph', to: 'sandbox' },
    { from: 'graph', to: 'indexer' },
  ];

  return (
    <div className="w-full bg-white rounded-3xl border border-[#E4E7EF] shadow-xl p-6 sm:p-8 relative overflow-hidden">
      {/* Top Suggestion Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#E4E7EF]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-xs font-bold text-[#0B1020] uppercase tracking-wider font-mono">
            Interactive Product Demo
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {MODE_KEYS.map(modeKey => {
            const itemCfg = DEMO_CONFIGS[modeKey];
            const isSelected = activeMode === modeKey;
            return (
              <button
                key={modeKey}
                onClick={() => handleSelectMode(modeKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0B1020] text-white shadow-sm'
                    : 'bg-[#F6F7FB] text-[#5B6478] hover:text-[#0B1020] hover:bg-[#E8ECFF]'
                }`}
              >
                {modeKey === 'reader' && <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />}
                {modeKey === 'plan' && <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />}
                {modeKey === 'context' && <Box className="w-3.5 h-3.5 text-[#F59E0B]" />}
                <span>{itemCfg.chipLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Demo Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Query Input & Word-by-Word Answer */}
        <div className="lg:col-span-7 space-y-4">
          {/* Query Input with self-typing cursor */}
          <div className="p-3.5 rounded-2xl bg-[#F6F7FB] border border-[#E4E7EF] flex items-center gap-3 shadow-inner">
            <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-[#E4E7EF] flex items-center justify-center text-[#3B5BFF] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 font-mono text-xs sm:text-sm font-semibold text-[#0B1020] flex items-center">
              <span>{typedQuery}</span>
              <span className="inline-block w-1.5 h-4 ml-1 bg-[#3B5BFF] animate-pulse" />
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#E8ECFF] text-[#3B5BFF] shrink-0">
              {cfg.badge}
            </span>
          </div>

          {/* Answer streaming card */}
          <div className="p-5 rounded-2xl bg-[#FAFAFC] border border-[#E4E7EF] relative min-h-[150px] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5B6478] font-bold">
                  Grounded Output
                </span>
                <span className="text-[10px] font-mono text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full font-semibold">
                  100% verified AST
                </span>
              </div>
              <p className="text-sm text-[#0B1020] leading-relaxed">
                {displayedAnswer}
                {isAnswerTyping && <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#3B5BFF] animate-pulse" />}
              </p>
            </div>

            {/* Citations Row with Popover */}
            <div className="mt-5 pt-4 border-t border-[#E4E7EF] flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-[#5B6478] font-bold mr-1">
                Verified Citations:
              </span>
              {cfg.citations.map((c, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredCitation(c)}
                  onMouseLeave={() => setHoveredCitation(null)}
                  className="relative group cursor-pointer"
                >
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#3B5BFF] hover:bg-[#E8ECFF]/30 font-mono text-xs text-[#3B5BFF] font-semibold transition-all shadow-xs">
                    <Code2 className="w-3 h-3 text-[#3B5BFF]" />
                    <span>{c.file}:{c.line}</span>
                  </span>

                  {/* Popover on hover */}
                  {hoveredCitation?.file === c.file && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-[#0B1020] text-white rounded-xl shadow-2xl border border-[#334155] z-30 pointer-events-none"
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#93C5FD] font-mono mb-1">
                        <span>{c.symbol}</span>
                        <span>{c.file}:{c.line}</span>
                      </div>
                      <pre className="text-[10px] font-mono text-[#CBD5E1] overflow-x-auto whitespace-pre bg-[#070B14] p-2 rounded-lg">
                        {c.code}
                      </pre>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: 2D SVG Graph with Glowing Path */}
        <div className="lg:col-span-5 rounded-2xl bg-[#F8FAFC] border border-[#E4E7EF] p-4 flex flex-col items-center justify-between relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2 px-2 text-xs font-mono text-[#64748B]">
            <span>AST DEPENDENCY GRAPH</span>
            <span className="text-[#3B5BFF] font-bold">2D VECTOR</span>
          </div>

          <svg viewBox="0 0 350 240" className="w-full h-auto max-h-[220px]">
            {/* Background grid */}
            <defs>
              <pattern id="demoSvgGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.8" fill="#CBD5E1" opacity="0.6" />
              </pattern>
              <filter id="svgGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#demoSvgGrid)" />

            {/* Inactive Edges */}
            {svgEdges.map((e, idx) => {
              const src = svgNodes.find(n => n.id === e.from)!;
              const dst = svgNodes.find(n => n.id === e.to)!;
              return (
                <line
                  key={idx}
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              );
            })}

            {/* Glowing Active Path */}
            <motion.path
              d={cfg.pathD}
              fill="none"
              stroke={activeMode === 'plan' ? '#10B981' : activeMode === 'context' ? '#0EA5E9' : '#3B5BFF'}
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#svgGlow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Nodes */}
            {svgNodes.map(n => {
              const isActive = cfg.activeNodeIds.includes(n.id);
              let nodeColor = n.color;

              if (activeMode === 'plan') {
                if (n.id === 'auth') nodeColor = '#16A34A'; // done
                if (n.id === 'graph') nodeColor = '#F59E0B'; // partial
                if (n.id === 'sandbox') nodeColor = '#EF4444'; // missing
              } else if (activeMode === 'context') {
                nodeColor = isActive ? '#0EA5E9' : '#94A3B8';
              }

              return (
                <g key={n.id}>
                  {/* Outer pulsating ring for active nodes */}
                  {isActive && (
                    <motion.circle
                      cx={n.x}
                      cy={n.y}
                      r={n.r + 5}
                      fill="none"
                      stroke={nodeColor}
                      strokeWidth="2"
                      initial={{ scale: 0.8, opacity: 0.8 }}
                      animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.2, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Entry point ring */}
                  {n.isEntry && (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.r + 3}
                      fill="none"
                      stroke="#3B5BFF"
                      strokeWidth="1.2"
                      strokeDasharray="2 2"
                      opacity="0.6"
                    />
                  )}

                  {/* Node circle */}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={n.r}
                    fill={nodeColor}
                    opacity={isActive ? 1 : 0.4}
                    className="transition-all duration-300"
                  />
                  <circle cx={n.x} cy={n.y} r={n.r * 0.38} fill="#FFFFFF" />

                  {/* Step number badge for Reader mode */}
                  {activeMode === 'reader' && n.step && isActive && (
                    <g>
                      <circle cx={n.x + 9} cy={n.y - 9} r={6} fill="#0B1020" />
                      <text
                        x={n.x + 9}
                        y={n.y - 7}
                        textAnchor="middle"
                        className="text-[8px] font-mono fill-white font-bold"
                      >
                        {n.step}
                      </text>
                    </g>
                  )}

                  {/* Status indicator for Plan mode */}
                  {activeMode === 'plan' && isActive && (
                    <circle
                      cx={n.x + 9}
                      cy={n.y - 9}
                      r={4}
                      fill={nodeColor}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Label */}
                  <text
                    x={n.x}
                    y={n.y + n.r + 12}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-[#475569] font-semibold"
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="w-full text-center pt-2 text-[11px] text-[#64748B] font-mono">
            Mode: <strong className="text-[#0B1020] uppercase">{activeMode}</strong> • Every claim cites real code (file:line).
          </div>
        </div>
      </div>
    </div>
  );
};
