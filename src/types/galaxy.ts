export type NodeSymbolType = 'module' | 'class' | 'function';

export interface GalaxyNode {
  id: string;
  name: string;
  module: string;
  cluster: string;
  type: NodeSymbolType;
  file: string;
  line: number;
  centrality: number; // 0.2 to 1.0 (determines sphere radius)
  isEntryPoint: boolean; // Entry points receive an outer glowing ring
  position: [number, number, number];
  connections: string[];
  tokenCount: number;
  docstring?: string;
}

export interface GalaxyCluster {
  id: string;
  name: string;
  color: string;
  nodeCount: number;
  center: [number, number, number];
  description: string;
}

export interface GalaxyEdge {
  id: string;
  source: string;
  target: string;
  type: 'import' | 'call' | 'inheritance';
  weight: number;
}

export interface GalaxyGraph {
  nodes: GalaxyNode[];
  edges: GalaxyEdge[];
  clusters: GalaxyCluster[];
}

export interface Citation {
  file: string;
  line: number;
  symbol: string;
  snippet: string;
}

export interface ReaderStep {
  step: number;
  nodeId: string;
  title: string;
  file: string;
  line: number;
  explanation: string;
  codeSnippet: string;
}

export interface ReaderResponse {
  mode: 'reader';
  query: string;
  summary: string;
  readingOrder: ReaderStep[];
  citations: Citation[];
  mermaidDiagram: string;
}

export type PlanItemStatus = 'done' | 'partial' | 'missing' | 'unknown';

export interface PlanItem {
  id: string;
  title: string;
  status: PlanItemStatus;
  description: string;
  nodeIds: string[]; // Connected code nodes in galaxy
  evidence: string[]; // file:line citations
  angle: number; // Ring radial angle in radians
}

export interface PlanResponse {
  mode: 'plan';
  query: string;
  summary: string;
  items: PlanItem[];
  citations: Citation[];
}

export interface ContextPackedNode {
  nodeId: string;
  tier: 'full' | 'signature';
  tokens: number;
  file: string;
  line: number;
  reason: string;
}

export interface ContextResponse {
  mode: 'context';
  query: string;
  totalTokens: number;
  budgetLimit: number;
  packedNodes: ContextPackedNode[];
  markdownContext: string;
  efficientPrompt: string;
  citations: Citation[];
}

export type QueryResponse = ReaderResponse | PlanResponse | ContextResponse;

export interface IndexStage {
  id: 'clone' | 'parse' | 'graph' | 'index';
  label: string;
  description: string;
  progress: number;
  status: 'pending' | 'running' | 'completed';
}

export interface RepoIndexStatus {
  status: 'not_indexed' | 'indexing' | 'ready' | 'failed';
  currentStage?: 'clone' | 'parse' | 'graph' | 'index';
  progress: number;
  stages: IndexStage[];
  nodeCount: number;
  edgeCount: number;
  lastIndexedAt?: string;
}
