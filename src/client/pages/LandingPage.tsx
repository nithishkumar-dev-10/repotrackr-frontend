import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import {
  Compass,
  CheckCircle2,
  Box,
  ArrowRight,
  GitBranch,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { InteractiveDemo } from '../components/InteractiveDemo';
import { useAuth } from '../context/AuthContext';

// Animated Number Counter component
const AnimatedNumber: React.FC<{ value: number; prefix?: string; suffix?: string }> = ({
  value,
  prefix = '',
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1200;
    const steps = 30;
    const stepDuration = duration / steps;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div ref={ref} className="font-extrabold text-[#0B1020]">
      {prefix}
      {displayValue}
      {suffix}
    </div>
  );
};

// Magnetic Button component
const MagneticButton: React.FC<{
  children: React.ReactNode;
  to: string;
  className?: string;
}> = ({ children, to, className = '' }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) * 0.25;
    const y = (e.clientY - (top + height / 2)) * 0.25;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', damping: 15, stiffness: 150 }}
    >
      <Link
        ref={ref}
        to={to}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={className}
      >
        {children}
      </Link>
    </motion.div>
  );
};

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeCardSpotlight, setActiveCardSpotlight] = useState<{ id: number; x: number; y: number } | null>(null);

  const pipelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: pipelineRef,
    offset: ['start 85%', 'end 50%'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  const lineWidth = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  const queryModes = [
    {
      id: 1,
      title: 'Reader Mode',
      tagline: 'Where to start & how it works',
      icon: Compass,
      color: '#3B5BFF',
      desc: 'Topological execution order with verified file:line citations and interactive module navigation.',
    },
    {
      id: 2,
      title: 'Plan Verifier',
      tagline: 'Audit roadmap vs code truth',
      icon: CheckCircle2,
      color: '#16A34A',
      desc: 'Checks each roadmap item against real AST symbols. Marks items Done, Partial, or Missing with code evidence.',
    },
    {
      id: 3,
      title: 'Context Packer',
      tagline: 'Token-budgeted prompt synthesis',
      icon: Box,
      color: '#F59E0B',
      desc: 'Packs full bodies and concise signatures into a strict token allowance, generating prompt-ready markdown.',
    },
  ];

  const pipelineSteps = [
    { step: '01', title: 'Shallow Clone', desc: 'Secure ephemeral sandbox isolation', icon: GitBranch, threshold: 0.1 },
    { step: '02', title: 'AST Parsing', desc: 'Class and function boundary extraction', icon: Cpu, threshold: 0.3 },
    { step: '03', title: 'Code Graph', desc: 'Directed call graph & Louvain clustering', icon: Layers, threshold: 0.5 },
    { step: '04', title: 'Deterministic Index', desc: 'Strict file:line symbol citation mapping', icon: Database, threshold: 0.7 },
    { step: '05', title: 'AI Reasoning', desc: 'Grounded explanation citing verified evidence', icon: Sparkles, threshold: 0.9 },
  ];

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#F6F7FB] overflow-hidden">
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Soft Ambient Blobs Drifting Slowly (Mesh background, no particles) */}
      <motion.div
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="glow-blob w-[580px] h-[580px] bg-[#3B5BFF]/10 top-0 left-1/4 pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 50, -40, 0],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        className="glow-blob w-[480px] h-[480px] bg-[#8B5CF6]/10 top-80 right-10 pointer-events-none"
      />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Subtitle Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8ECFF] border border-[#3B5BFF]/20 text-[#3B5BFF] text-xs font-bold mb-6 shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Static analysis decides what is true. AI only retrieves and explains.</span>
          </motion.div>

          {/* Big Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold text-[#0B1020] tracking-tight leading-[1.12]"
          >
            Understand any Python repo in <span className="text-[#3B5BFF]">minutes</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-[#5B6478] leading-relaxed max-w-2xl mx-auto"
          >
            Paste a GitHub repository link. RepoTrackr parses syntax trees, compiles a dependency graph, and answers architecture questions with verified code citations. Every claim cites real code (<code className="font-mono text-sm text-[#0B1020] bg-white px-1.5 py-0.5 rounded border border-[#E4E7EF]">file:line</code>).
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton
              to={isAuthenticated ? '/dashboard' : '/signup'}
              className="px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#0B1020] hover:bg-[#1E293B] shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>

            <button
              onClick={scrollToHowItWorks}
              className="px-6 py-3.5 rounded-xl text-sm font-bold text-[#0B1020] bg-white hover:bg-[#F6F7FB] border border-[#E4E7EF] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>See how it works</span>
              <ChevronDown className="w-4 h-4 text-[#5B6478]" />
            </button>
          </motion.div>
        </div>

        {/* Interactive Product Demo Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 max-w-5xl mx-auto"
        >
          <InteractiveDemo />
        </motion.div>
      </section>

      {/* Query Modes Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E4E7EF]/80 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-[#0B1020]">Three ways to query your repo</h2>
          <p className="mt-3 text-sm text-[#5B6478]">
            Static analysis decides what is true. AI only retrieves and explains.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {queryModes.map(mode => {
            const Icon = mode.icon;
            const isSpotlight = activeCardSpotlight?.id === mode.id;

            return (
              <motion.div
                key={mode.id}
                onMouseMove={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setActiveCardSpotlight({
                    id: mode.id,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }}
                onMouseLeave={() => setActiveCardSpotlight(null)}
                whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
                transition={{ duration: 0.2 }}
                className="p-8 rounded-3xl bg-white border border-[#E4E7EF] shadow-md hover:shadow-xl transition-all relative overflow-hidden group perspective-1000"
              >
                {/* Spotlight cursor-follow hover effect */}
                {isSpotlight && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity opacity-100"
                    style={{
                      background: `radial-gradient(320px circle at ${activeCardSpotlight.x}px ${activeCardSpotlight.y}px, ${mode.color}15, transparent 80%)`,
                    }}
                  />
                )}

                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${mode.color}15`, color: mode.color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0B1020]">{mode.title}</h3>
                <p className="text-xs font-semibold text-[#3B5BFF] mt-1">{mode.tagline}</p>
                <p className="text-sm text-[#5B6478] mt-3 leading-relaxed">{mode.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How It Works Pipeline (Scroll-linked drawing line) */}
      <section
        id="how-it-works"
        ref={pipelineRef}
        className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E4E7EF]/80 relative z-10"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-[#0B1020]">How the Ingestion Engine Works</h2>
          <p className="mt-3 text-sm text-[#5B6478]">
            A staged deterministic pipeline computes ground truth before answering.
          </p>
        </div>

        <div className="relative">
          {/* Base background line */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-1 bg-[#E2E8F0] -translate-y-1/2 z-0" />
          
          {/* Scroll-linked drawing line */}
          <motion.div
            style={{ width: lineWidth }}
            className="hidden lg:block absolute top-1/2 left-8 h-1 bg-gradient-to-r from-[#3B5BFF] via-[#6366F1] to-[#38BDF8] -translate-y-1/2 z-0 origin-left"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {pipelineSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="p-6 rounded-2xl bg-white border border-[#E4E7EF] shadow-sm hover:shadow-md hover:border-[#3B5BFF]/40 transition-all text-center flex flex-col items-center group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#E8ECFF] text-[#3B5BFF] font-bold text-xs flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {step.step}
                  </div>
                  <Icon className="w-5 h-5 text-[#0B1020] mb-2 text-[#3B5BFF]" />
                  <h4 className="font-bold text-sm text-[#0B1020]">{step.title}</h4>
                  <p className="text-xs text-[#5B6478] mt-1.5 leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section with Animated Counters */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E4E7EF] shadow-xl flex flex-wrap justify-around items-center gap-8">
          <div className="text-center">
            <div className="text-4xl text-[#3B5BFF]">
              <AnimatedNumber value={100} suffix="%" />
            </div>
            <div className="text-xs text-[#5B6478] font-mono mt-1 font-semibold">CITATION GROUNDING</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold text-[#16A34A] font-mono">file:line</div>
            <div className="text-xs text-[#5B6478] font-mono mt-1 font-semibold">EXACT CODE ANCHORS</div>
          </div>
          <div className="text-center">
            <div className="text-4xl text-[#6366F1]">
              <AnimatedNumber value={6} />
            </div>
            <div className="text-xs text-[#5B6478] font-mono mt-1 font-semibold">MODULE CLUSTERS</div>
          </div>
          <div className="text-center">
            <div className="text-4xl text-[#0EA5E9]">
              <AnimatedNumber value={80} prefix="~" />
            </div>
            <div className="text-xs text-[#5B6478] font-mono mt-1 font-semibold">INDEXED SYMBOLS</div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 text-center px-4 relative z-10">
        <h2 className="text-3xl font-extrabold text-[#0B1020]">Ready to explore your repository?</h2>
        <p className="mt-3 text-sm text-[#5B6478] max-w-md mx-auto">
          Start ingesting public Python repositories and query code with deterministic certainty.
        </p>
        <div className="mt-8 flex justify-center">
          <MagneticButton
            to={isAuthenticated ? '/dashboard' : '/signup'}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white bg-[#3B5BFF] hover:bg-[#2563EB] shadow-lg shadow-[#3B5BFF]/30 transition-all cursor-pointer"
          >
            <span>Launch RepoTrackr AI</span>
            <ArrowRight className="w-4 h-4" />
          </MagneticButton>
        </div>
      </section>
    </div>
  );
};
