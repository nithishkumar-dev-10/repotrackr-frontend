import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  CheckCircle2,
  Box,
  Sparkles,
  ArrowLeft,
  Search,
  Copy,
  Check,
  ChevronRight,
  Database,
  ExternalLink,
  Layers,
  FileCode,
  ShieldAlert,
  GitBranch,
} from 'lucide-react';
import { api } from '../../api/client';
import {
  getGalaxyGraph,
  runGalaxyQuery,
  getIndexStatus,
  getPlanVerification,
  getReaderGuide,
} from '../../api/galaxy';
import {
  GalaxyGraph,
  GalaxyNode,
  ReaderResponse,
  PlanResponse,
  ContextResponse,
  PlanItem,
  RepoIndexStatus,
} from '../../types/galaxy';
import { GalaxyCanvas } from '../components/3d/GalaxyCanvas';
import { CommandBar } from '../components/CommandBar';
import { MermaidViewer } from '../components/MermaidViewer';

export const RepoWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [repo, setRepo] = useState<any>(null);
  const [graph, setGraph] = useState<GalaxyGraph | null>(null);
  const [indexStatus, setIndexStatus] = useState<RepoIndexStatus | null>(null);
  const [isDemoData, setIsDemoData] = useState(false);

  // Workspace Mode: Reader, Plan, or Context
  const [activeMode, setActiveMode] = useState<'reader' | 'plan' | 'context'>('reader');
  const [viewType, setViewType] = useState<'3d' | '2d'>('3d');

  // Mode responses
  const [readerData, setReaderData] = useState<ReaderResponse | null>(null);
  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const [contextData, setContextData] = useState<ContextResponse | null>(null);

  // Selected sub-elements
  const [selectedStep, setSelectedStep] = useState<number | null>(1);
  const [selectedPlanItem, setSelectedPlanItem] = useState<string | null>('plan_1');
  const [selectedNode, setSelectedNode] = useState<GalaxyNode | null>(null);

  // UI States
  const [queryInput, setQueryInput] = useState('');
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [copiedContext, setCopiedContext] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [indexingStagesSimulated, setIndexingStagesSimulated] = useState(false);

  // Initial Load
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      // 1. Load Repo
      const repoRes = await api.getRepo(id);
      if (repoRes.ok && repoRes.data) {
        setRepo(repoRes.data);
      } else {
        setRepo({ id, name: 'repotrackr-engine', owner: 'pallets', url: 'https://github.com/pallets/flask', status: 'ready' });
      }

      // 2. Load Galaxy Graph
      const graphRes = await getGalaxyGraph(id);
      setGraph(graphRes.data);
      setIsDemoData(graphRes.isDemoData);

      // 3. Load Index Status
      const statusRes = await getIndexStatus(id);
      setIndexStatus(statusRes.data);

      // 4. Load Reader Guide & Plan by default
      const readerRes = await getReaderGuide(id);
      setReaderData(readerRes.data);

      const planRes = await getPlanVerification(id);
      setPlanData(planRes.data);
    };

    loadData();
  }, [id]);

  // Run Query
  const handleRunQuery = async (queryText: string, modeOverride?: 'reader' | 'plan' | 'context') => {
    if (!id || !queryText.trim()) return;
    setLoadingQuery(true);
    const res = await runGalaxyQuery(id, queryText, modeOverride);
    setLoadingQuery(false);

    if (res.data.mode === 'reader') {
      setActiveMode('reader');
      setReaderData(res.data as ReaderResponse);
      setSelectedStep(1);
    } else if (res.data.mode === 'plan') {
      setActiveMode('plan');
      setPlanData(res.data as PlanResponse);
      setSelectedPlanItem((res.data as PlanResponse).items[0]?.id || null);
    } else if (res.data.mode === 'context') {
      setActiveMode('context');
      setContextData(res.data as ContextResponse);
    }
    setQueryInput('');
  };

  const handleCopy = (text: string, type: 'context' | 'prompt') => {
    navigator.clipboard.writeText(text);
    if (type === 'context') {
      setCopiedContext(true);
      setTimeout(() => setCopiedContext(false), 2000);
    } else {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const activePlanObject = planData?.items.find(i => i.id === selectedPlanItem);
  const activeReaderStep = readerData?.readingOrder.find(s => s.step === selectedStep);

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-[#E4E7EF] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-1.5 rounded-lg border border-[#E4E7EF] hover:bg-[#F6F7FB] text-[#5B6478] hover:text-[#0B1020] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#5B6478]">{repo?.owner || 'pallets'} /</span>
              <h2 className="text-base font-extrabold text-[#0B1020]">{repo?.name || 'repo'}</h2>
              {isDemoData && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                  Demo Data (Backend 501)
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-[#5B6478] flex items-center gap-2">
              <span>Status: <strong className="text-[#16A34A]">{repo?.status || 'ready'}</strong></span>
              <span>•</span>
              <span>{graph?.nodes.length || 78} AST Nodes</span>
              <span>•</span>
              <span>{graph?.edges.length || 45} Dependency Edges</span>
            </p>
          </div>
        </div>

        {/* View and Command Bar controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl p-1 bg-[#F6F7FB] border border-[#E4E7EF] text-xs font-semibold">
            <button
              onClick={() => setViewType('3d')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewType === '3d' ? 'bg-white text-[#0B1020] shadow-xs' : 'text-[#5B6478] hover:text-[#0B1020]'
              }`}
            >
              3D Galaxy
            </button>
            <button
              onClick={() => setViewType('2d')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewType === '2d' ? 'bg-white text-[#0B1020] shadow-xs' : 'text-[#5B6478] hover:text-[#0B1020]'
              }`}
            >
              2D / List View
            </button>
          </div>

          <button
            onClick={() => setCommandBarOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0B1020] text-white text-xs font-semibold hover:bg-[#1E293B] shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="hidden sm:inline">Ask AI Reasoning</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">⌘K</kbd>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Layout */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-hidden">
        {/* Left Pane: 3D Galaxy Canvas (or 2D diagram) */}
        <div className="w-full lg:w-3/5 h-[480px] lg:h-[calc(100vh-140px)] relative">
          {viewType === '3d' && graph ? (
            <GalaxyCanvas
              graph={graph}
              activeMode={activeMode}
              readerData={readerData}
              planData={planData}
              contextData={contextData}
              selectedStep={selectedStep}
              selectedPlanItem={selectedPlanItem}
              onSelectNode={setSelectedNode}
              onSelectPlanItem={item => setSelectedPlanItem(item.id)}
            />
          ) : (
            <div className="w-full h-full rounded-2xl bg-white border border-[#E4E7EF] shadow-md p-6 overflow-y-auto">
              <h3 className="font-bold text-sm text-[#0B1020] mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#3B5BFF]" />
                <span>2D Architectural Topology & Reading Graph</span>
              </h3>
              <MermaidViewer
                chart={
                  readerData?.mermaidDiagram ||
                  `graph TD\n  A[App Factory] --> B[Feature Routers]\n  B --> C[Orchestrator]\n  C --> D[AST Visitor]\n  D --> E[Evidence Index]`
                }
              />
            </div>
          )}

          {/* Staged Indexing Timeline Widget */}
          {indexStatus && (
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-[#E4E7EF] shadow-lg rounded-xl p-3 max-w-[280px] text-xs hidden sm:block">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[#0B1020] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#3B5BFF]" />
                  Deterministic Pipeline
                </span>
                <span className="font-mono text-[10px] text-[#16A34A] font-bold">100% COMPLETE</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-[#5B6478]">
                {indexStatus.stages.map(st => (
                  <div key={st.id} className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#16A34A]" />
                      {st.label}
                    </span>
                    <span className="text-[#0B1020]">Ready</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: Light Interactive Answer & Controls Panel */}
        <div className="w-full lg:w-2/5 flex flex-col h-[580px] lg:h-[calc(100vh-140px)] bg-white rounded-2xl border border-[#E4E7EF] shadow-xl overflow-hidden">
          {/* Query Bar */}
          <div className="p-3.5 border-b border-[#E4E7EF] bg-[#F6F7FB]/60">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleRunQuery(queryInput);
              }}
              className="relative flex items-center"
            >
              <Search className="w-4 h-4 text-[#5B6478] absolute left-3.5" />
              <input
                type="text"
                value={queryInput}
                onChange={e => setQueryInput(e.target.value)}
                placeholder="Ask e.g. 'Where do I start?' or 'Check plan'..."
                className="w-full pl-9 pr-24 py-2.5 rounded-xl border border-[#E4E7EF] bg-white focus:border-[#3B5BFF] focus:outline-none text-xs"
              />
              <button
                type="submit"
                disabled={loadingQuery || !queryInput.trim()}
                className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-[#3B5BFF] text-white font-bold text-xs hover:bg-[#2563EB] disabled:opacity-40 transition-all cursor-pointer"
              >
                {loadingQuery ? 'Thinking...' : 'Query'}
              </button>
            </form>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-[#E4E7EF] px-3 pt-2 bg-white">
            <button
              onClick={() => setActiveMode('reader')}
              className={`flex-1 pb-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeMode === 'reader'
                  ? 'border-[#3B5BFF] text-[#3B5BFF]'
                  : 'border-transparent text-[#5B6478] hover:text-[#0B1020]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Reader Mode</span>
            </button>

            <button
              onClick={() => setActiveMode('plan')}
              className={`flex-1 pb-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeMode === 'plan'
                  ? 'border-[#16A34A] text-[#16A34A]'
                  : 'border-transparent text-[#5B6478] hover:text-[#0B1020]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Plan Verifier</span>
            </button>

            <button
              onClick={() => setActiveMode('context')}
              className={`flex-1 pb-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeMode === 'context'
                  ? 'border-[#F59E0B] text-[#F59E0B]'
                  : 'border-transparent text-[#5B6478] hover:text-[#0B1020]'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Context Packer</span>
            </button>
          </div>

          {/* Mode Body Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* READER MODE */}
            {activeMode === 'reader' && readerData && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-[#0B1020]">Architecture Onboarding Order</h3>
                  <p className="text-xs text-[#5B6478] mt-1 leading-relaxed">{readerData.summary}</p>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6478]">
                    Reading Path Steps ({readerData.readingOrder.length})
                  </span>
                  {readerData.readingOrder.map(item => {
                    const isSelected = selectedStep === item.step;
                    return (
                      <div
                        key={item.step}
                        onClick={() => setSelectedStep(item.step)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#E8ECFF]/40 border-[#3B5BFF] shadow-xs'
                            : 'bg-[#F6F7FB] border-[#E4E7EF] hover:border-[#3B5BFF]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#3B5BFF] text-white flex items-center justify-center font-bold text-[10px]">
                              {item.step}
                            </span>
                            <span className="font-bold text-xs text-[#0B1020]">{item.title}</span>
                          </div>
                          <span className="font-mono text-[11px] text-[#3B5BFF] font-semibold">
                            {item.file}:{item.line}
                          </span>
                        </div>
                        <p className="text-xs text-[#5B6478] pl-7 leading-relaxed">{item.explanation}</p>

                        {isSelected && (
                          <div className="mt-3 pl-7">
                            <div className="p-3 rounded-lg bg-[#0B1020] text-[#93C5FD] font-mono text-[11px] overflow-x-auto whitespace-pre border border-[#1E293B]">
                              {item.codeSnippet}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PLAN VERIFIER MODE */}
            {activeMode === 'plan' && planData && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-[#0B1020]">Roadmap Implementation Audit</h3>
                  <p className="text-xs text-[#5B6478] mt-1 leading-relaxed">{planData.summary}</p>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6478]">
                    Plan Milestones ({planData.items.length})
                  </span>
                  {planData.items.map(item => {
                    const isSelected = selectedPlanItem === item.id;
                    const statusColors = {
                      done: 'bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]',
                      partial: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
                      missing: 'bg-[#FEE2E2] text-[#EF4444] border-[#FCA5A5]',
                      unknown: 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]',
                    };

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedPlanItem(item.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-[#0B1020] shadow-md ring-2 ring-[#0B1020]/5'
                            : 'bg-[#F6F7FB] border-[#E4E7EF] hover:border-[#3B5BFF]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-bold text-xs text-[#0B1020]">{item.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColors[item.status]}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#5B6478] leading-relaxed">{item.description}</p>

                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-[#E4E7EF]">
                            <span className="text-[10px] font-bold text-[#0B1020] uppercase tracking-wider block mb-1">
                              Evidence Citations (Connected 3D Beam)
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.evidence.map((ev, eIdx) => (
                                <span
                                  key={eIdx}
                                  className="px-2 py-0.5 rounded bg-white border border-[#E4E7EF] font-mono text-[11px] text-[#3B5BFF] font-semibold"
                                >
                                  {ev}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CONTEXT PACKER MODE */}
            {activeMode === 'context' && contextData && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-[#0B1020]">Token-Budgeted Context Pack</h3>
                  <p className="text-xs text-[#5B6478] mt-1 leading-relaxed">
                    Compressed context pack adhering strictly to target token limits.
                  </p>
                </div>

                {/* Token Budget Bar */}
                <div className="p-4 rounded-xl bg-[#F6F7FB] border border-[#E4E7EF]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[#0B1020]">Token Budget Allocation</span>
                    <span className="font-mono text-[#3B5BFF] font-bold">
                      {contextData.totalTokens} / {contextData.budgetLimit} tokens
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#E4E7EF] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#3B5BFF] to-[#38BDF8] rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (contextData.totalTokens / contextData.budgetLimit) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Tier Nodes */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6478]">
                    Packed Modules ({contextData.packedNodes.length})
                  </span>
                  {contextData.packedNodes.map((pn, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3 rounded-xl border border-[#E4E7EF] bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-[#0B1020]">
                          {pn.file}:{pn.line}
                        </div>
                        <p className="text-[11px] text-[#5B6478] mt-0.5">{pn.reason}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            pn.tier === 'full'
                              ? 'bg-[#E0F2FE] text-[#0369A1]'
                              : 'bg-[#EEF2FF] text-[#4F46E5]'
                          }`}
                        >
                          {pn.tier} tier
                        </span>
                        <div className="font-mono text-[10px] text-[#5B6478] mt-1">
                          ~{pn.tokens} tokens
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Copy Markdown & Prompt */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0B1020]">Generated Context Output</span>
                    <button
                      onClick={() => handleCopy(contextData.markdownContext, 'context')}
                      className="px-3 py-1 rounded-lg border border-[#E4E7EF] hover:bg-[#F6F7FB] text-xs font-semibold text-[#3B5BFF] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedContext ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedContext ? 'Copied Context' : 'Copy Markdown'}</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B1020] text-[#93C5FD] font-mono text-[11px] max-h-48 overflow-y-auto whitespace-pre border border-[#1E293B]">
                    {contextData.markdownContext}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-bold text-[#0B1020]">Synthesized Prompt</span>
                    <button
                      onClick={() => handleCopy(contextData.efficientPrompt, 'prompt')}
                      className="px-3 py-1 rounded-lg border border-[#E4E7EF] hover:bg-[#F6F7FB] text-xs font-semibold text-[#16A34A] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedPrompt ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPrompt ? 'Copied Prompt' : 'Copy Prompt'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F6F7FB] border border-[#E4E7EF] text-xs text-[#0B1020] leading-relaxed">
                    {contextData.efficientPrompt}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Command Bar Modal */}
      <CommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
        onRunQuery={handleRunQuery}
      />
    </div>
  );
};
