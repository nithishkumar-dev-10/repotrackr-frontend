import { GalaxyGraph, GalaxyCluster, GalaxyNode, GalaxyEdge, ReaderResponse, PlanResponse, ContextResponse, RepoIndexStatus } from '../types/galaxy';

export const MOCK_CLUSTERS: GalaxyCluster[] = [
  { id: 'c_gateway', name: 'API & Gateway', color: '#7C93FF', nodeCount: 12, center: [0, 8, 4], description: 'HTTP endpoints, routers, authentication and schema validation' },
  { id: 'c_parser', name: 'AST & Parsing', color: '#38BDF8', nodeCount: 16, center: [-12, 3, -6], description: 'Python AST visitors, token extraction, tree-sitter grammars' },
  { id: 'c_graph', name: 'Dependency Graph', color: '#818CF8', nodeCount: 18, center: [-4, -8, 8], description: 'Directed acyclic call graph, import resolution, cycle detection' },
  { id: 'c_indexer', name: 'Evidence Indexer', color: '#34D399', nodeCount: 16, center: [14, 2, -4], description: 'Deterministic line mapper, chunk boundary indexer, symbol registry' },
  { id: 'c_reasoning', name: 'AI Reasoning', color: '#F472B6', nodeCount: 14, center: [6, -9, -8], description: 'Prompt packers, evidence validator, contextual synthesis' },
  { id: 'c_core', name: 'Core Pipeline', color: '#FBBF24', nodeCount: 12, center: [0, 0, 0], description: 'Orchestrator, workspace manager, git clone sandbox' },
];

function generateGalaxyGraph(): GalaxyGraph {
  const nodes: GalaxyNode[] = [];
  const edges: GalaxyEdge[] = [];

  const rawNodeDefs: Array<{
    id: string;
    name: string;
    module: string;
    cluster: string;
    type: 'module' | 'class' | 'function';
    file: string;
    line: number;
    centrality: number;
    isEntryPoint: boolean;
    tokenCount: number;
    docstring: string;
  }> = [
    // c_gateway
    { id: 'n_main', name: 'create_app()', module: 'app.main', cluster: 'c_gateway', type: 'function', file: 'app/main.py', line: 34, centrality: 0.95, isEntryPoint: true, tokenCount: 420, docstring: 'FastAPI application factory and middleware configuration.' },
    { id: 'n_cors', name: 'CORSMiddleware', module: 'app.main', cluster: 'c_gateway', type: 'class', file: 'app/main.py', line: 41, centrality: 0.6, isEntryPoint: false, tokenCount: 180, docstring: 'Cross-origin resource sharing configuration.' },
    { id: 'n_auth_router', name: 'auth_router', module: 'app.features.auth.router', cluster: 'c_gateway', type: 'module', file: 'app/features/auth/router.py', line: 53, centrality: 0.85, isEntryPoint: true, tokenCount: 850, docstring: 'Authentication endpoints: signup, verify, login, refresh.' },
    { id: 'n_login_handler', name: 'login()', module: 'app.features.auth.router', cluster: 'c_gateway', type: 'function', file: 'app/features/auth/router.py', line: 194, centrality: 0.8, isEntryPoint: false, tokenCount: 310, docstring: 'Authenticates credentials and issues JWT token pairs.' },
    { id: 'n_repos_router', name: 'repos_router', module: 'app.features.repos.router', cluster: 'c_gateway', type: 'module', file: 'app/features/repos/router.py', line: 14, centrality: 0.88, isEntryPoint: true, tokenCount: 620, docstring: 'Repository CRUD and tracking router.' },
    { id: 'n_create_repo', name: 'create_repo()', module: 'app.features.repos.router', cluster: 'c_gateway', type: 'function', file: 'app/features/repos/router.py', line: 21, centrality: 0.75, isEntryPoint: false, tokenCount: 380, docstring: 'Saves GitHub link and schedules ingestion job.' },
    { id: 'n_owned_dep', name: 'get_owned_repo()', module: 'app.features.repos.dependencies', cluster: 'c_gateway', type: 'function', file: 'app/features/repos/dependencies.py', line: 18, centrality: 0.7, isEntryPoint: false, tokenCount: 240, docstring: 'Validates repository ownership to block probing.' },
    { id: 'n_ratelimit', name: 'Limiter', module: 'app.core.ratelimit', cluster: 'c_gateway', type: 'class', file: 'app/core/ratelimit.py', line: 12, centrality: 0.55, isEntryPoint: false, tokenCount: 190, docstring: 'Per-IP sliding window rate limiter.' },
    { id: 'n_schema_repo', name: 'RepoCreate', module: 'app.schemas.repo', cluster: 'c_gateway', type: 'class', file: 'app/schemas/repo.py', line: 48, centrality: 0.65, isEntryPoint: false, tokenCount: 220, docstring: 'Pydantic validation for incoming GitHub URLs.' },
    { id: 'n_schema_auth', name: 'SignupRequest', module: 'app.schemas.auth', cluster: 'c_gateway', type: 'class', file: 'app/schemas/auth.py', line: 20, centrality: 0.5, isEntryPoint: false, tokenCount: 170, docstring: 'Schema for user registration and password rules.' },
    { id: 'n_jwt_signer', name: 'create_access_token()', module: 'app.security.tokens', cluster: 'c_gateway', type: 'function', file: 'app/security/tokens.py', line: 34, centrality: 0.72, isEntryPoint: false, tokenCount: 280, docstring: 'Signs HS256 JWT access token with expiry.' },
    { id: 'n_hasher', name: 'hash_password()', module: 'app.security.passwords', cluster: 'c_gateway', type: 'function', file: 'app/security/passwords.py', line: 8, centrality: 0.68, isEntryPoint: false, tokenCount: 160, docstring: 'Argon2-id cryptographic password hashing.' },

    // c_core
    { id: 'n_orchestrator', name: 'PipelineOrchestrator', module: 'pipeline.orchestrator', cluster: 'c_core', type: 'class', file: 'app/pipeline/orchestrator.py', line: 28, centrality: 0.98, isEntryPoint: true, tokenCount: 920, docstring: 'Coordinates repository ingestion, parsing, and graph indexing.' },
    { id: 'n_git_sandbox', name: 'GitSandbox', module: 'pipeline.clone.sandbox', cluster: 'c_core', type: 'class', file: 'app/pipeline/clone/sandbox.py', line: 15, centrality: 0.82, isEntryPoint: false, tokenCount: 510, docstring: 'Isolated containerized shallow git clone executor.' },
    { id: 'n_repo_cache', name: 'DiskCache', module: 'pipeline.cache.store', cluster: 'c_core', type: 'class', file: 'app/pipeline/cache/store.py', line: 22, centrality: 0.65, isEntryPoint: false, tokenCount: 340, docstring: 'SHA-256 content-addressable local tree cache.' },
    { id: 'n_config_mgr', name: 'Settings', module: 'core.config', cluster: 'c_core', type: 'class', file: 'app/core/config.py', line: 12, centrality: 0.78, isEntryPoint: false, tokenCount: 290, docstring: 'Pydantic settings loaded from environment.' },
    { id: 'n_event_bus', name: 'ProgressEventEmitter', module: 'pipeline.events', cluster: 'c_core', type: 'class', file: 'app/pipeline/events.py', line: 40, centrality: 0.6, isEntryPoint: false, tokenCount: 260, docstring: 'Publishes ingestion milestones across stages.' },
    { id: 'n_worker_pool', name: 'TaskWorkerPool', module: 'tasks.pool', cluster: 'c_core', type: 'class', file: 'app/tasks/pool.py', line: 19, centrality: 0.58, isEntryPoint: false, tokenCount: 380, docstring: 'Asyncio threadpool for CPU-bound AST visitors.' },
    { id: 'n_file_filter', name: 'PathFilter', module: 'pipeline.clone.filter', cluster: 'c_core', type: 'class', file: 'app/pipeline/clone/filter.py', line: 11, centrality: 0.45, isEntryPoint: false, tokenCount: 150, docstring: 'Ignores binary, vendor, and test fixtures.' },
    { id: 'n_workspace_ctx', name: 'WorkspaceContext', module: 'pipeline.workspace', cluster: 'c_core', type: 'class', file: 'app/pipeline/workspace.py', line: 31, centrality: 0.62, isEntryPoint: false, tokenCount: 210, docstring: 'Ephemerally mounted directory for code analysis.' },
    { id: 'n_db_engine', name: 'get_db()', module: 'core.database', cluster: 'c_core', type: 'function', file: 'app/core/database.py', line: 25, centrality: 0.74, isEntryPoint: false, tokenCount: 195, docstring: 'Yields SQLAlchemy database session per request.' },
    { id: 'n_repo_model', name: 'Repo', module: 'models.repo', cluster: 'c_core', type: 'class', file: 'app/models/repo.py', line: 10, centrality: 0.69, isEntryPoint: false, tokenCount: 230, docstring: 'Database entity storing repo URL, owner, and status.' },
    { id: 'n_user_model', name: 'User', module: 'models.user', cluster: 'c_core', type: 'class', file: 'app/models/user.py', line: 14, centrality: 0.71, isEntryPoint: false, tokenCount: 240, docstring: 'User record with email tokens and repo relationships.' },
    { id: 'n_cleaner', name: 'cleanup_sandbox()', module: 'pipeline.clone.cleanup', cluster: 'c_core', type: 'function', file: 'app/pipeline/clone/cleanup.py', line: 45, centrality: 0.35, isEntryPoint: false, tokenCount: 120, docstring: 'Purges temporary git worktrees upon completion.' },

    // c_parser
    { id: 'n_ast_visitor', name: 'ModuleVisitor', module: 'pipeline.chunking.ast_visitor', cluster: 'c_parser', type: 'class', file: 'app/pipeline/chunking/ast_visitor.py', line: 42, centrality: 0.9, isEntryPoint: false, tokenCount: 780, docstring: 'Inspects AST nodes for class and function declarations.' },
    { id: 'n_tree_sitter', name: 'PythonGrammarParser', module: 'pipeline.chunking.tree_sitter', cluster: 'c_parser', type: 'class', file: 'app/pipeline/chunking/tree_sitter.py', line: 18, centrality: 0.84, isEntryPoint: false, tokenCount: 610, docstring: 'Fault-tolerant CST parser for partial syntax trees.' },
    { id: 'n_import_resolver', name: 'ImportResolver', module: 'pipeline.chunking.resolver', cluster: 'c_parser', type: 'class', file: 'app/pipeline/chunking/resolver.py', line: 36, centrality: 0.86, isEntryPoint: false, tokenCount: 540, docstring: 'Resolves relative and package imports to absolute file paths.' },
    { id: 'n_symbol_extractor', name: 'extract_symbols()', module: 'pipeline.chunking.symbols', cluster: 'c_parser', type: 'function', file: 'app/pipeline/chunking/symbols.py', line: 22, centrality: 0.77, isEntryPoint: false, tokenCount: 390, docstring: 'Extracts classes, signatures, decorators, and type hints.' },
    { id: 'n_docstring_parser', name: 'DocstringParser', module: 'pipeline.chunking.docstring', cluster: 'c_parser', type: 'class', file: 'app/pipeline/chunking/docstring.py', line: 14, centrality: 0.52, isEntryPoint: false, tokenCount: 260, docstring: 'Parses Google, Sphinx, and NumPy formatted docstrings.' },
    { id: 'n_chunk_splitter', name: 'SemanticChunker', module: 'pipeline.chunking.splitter', cluster: 'c_parser', type: 'class', file: 'app/pipeline/chunking/splitter.py', line: 55, centrality: 0.73, isEntryPoint: false, tokenCount: 440, docstring: 'Splits large source files without breaking method bodies.' },
    { id: 'n_call_analyzer', name: 'CallExpressionAnalyzer', module: 'pipeline.chunking.calls', cluster: 'c_parser', type: 'class', file: 'app/pipeline/chunking/calls.py', line: 29, centrality: 0.68, isEntryPoint: false, tokenCount: 310, docstring: 'Maps function invocations to caller and callee nodes.' },
    { id: 'n_alias_tracker', name: 'AliasTracker', module: 'pipeline.chunking.alias', cluster: 'c_parser', type: 'class', file: 'app/pipeline/chunking/alias.py', line: 16, centrality: 0.48, isEntryPoint: false, tokenCount: 180, docstring: 'Tracks import alias mappings like "import numpy as np".' },
    { id: 'n_decorator_vis', name: 'DecoratorVisitor', module: 'pipeline.chunking.decorators', cluster: 'c_parser', type: 'class', file: 'app/pipeline/chunking/decorators.py', line: 12, centrality: 0.42, isEntryPoint: false, tokenCount: 160, docstring: 'Identifies routing and caching decorators on methods.' },
    { id: 'n_type_annotator', name: 'TypeAnnotator', module: 'pipeline.chunking.types', cluster: 'c_parser', type: 'class', file: 'app/pipeline/chunking/types.py', line: 24, centrality: 0.54, isEntryPoint: false, tokenCount: 220, docstring: 'Records PEP 484 type annotations for symbols.' },
    { id: 'n_scope_manager', name: 'LexicalScopeManager', module: 'pipeline.chunking.scope', cluster: 'c_parser', type: 'class', file: 'app/pipeline/chunking/scope.py', line: 38, centrality: 0.61, isEntryPoint: false, tokenCount: 290, docstring: 'Maintains variable and function visibility scope stack.' },
    { id: 'n_dunder_filter', name: 'filter_dunders()', module: 'pipeline.chunking.filters', cluster: 'c_parser', type: 'function', file: 'app/pipeline/chunking/filters.py', line: 8, centrality: 0.32, isEntryPoint: false, tokenCount: 110, docstring: 'Excludes boilerplate magic methods unless overridden.' },
    { id: 'n_syntax_validator', name: 'validate_syntax()', module: 'pipeline.chunking.validator', cluster: 'c_parser', type: 'function', file: 'app/pipeline/chunking/validator.py', line: 19, centrality: 0.38, isEntryPoint: false, tokenCount: 130, docstring: 'Checks Python syntax compliance before AST build.' },
    { id: 'n_line_mapper', name: 'SpanLineMapper', module: 'pipeline.chunking.lines', cluster: 'c_parser', type: 'class', file: 'app/pipeline/chunking/lines.py', line: 15, centrality: 0.59, isEntryPoint: false, tokenCount: 200, docstring: 'Converts character byte offsets to 1-indexed file:line spans.' },
    { id: 'n_comment_extractor', name: 'extract_comments()', module: 'pipeline.chunking.comments', cluster: 'c_parser', type: 'function', file: 'app/pipeline/chunking/comments.py', line: 10, centrality: 0.28, isEntryPoint: false, tokenCount: 95, docstring: 'Isolates header comments and inline documentation.' },
    { id: 'n_lambda_detector', name: 'detect_lambdas()', module: 'pipeline.chunking.lambdas', cluster: 'c_parser', type: 'function', file: 'app/pipeline/chunking/lambdas.py', line: 17, centrality: 0.3, isEntryPoint: false, tokenCount: 105, docstring: 'Indexes inline lambda closures and higher-order calls.' },

    // c_graph
    { id: 'n_code_graph', name: 'CodeGraph', module: 'pipeline.graph.builder', cluster: 'c_graph', type: 'class', file: 'app/pipeline/graph/builder.py', line: 35, centrality: 0.94, isEntryPoint: false, tokenCount: 880, docstring: 'Graph data structure holding all nodes, edges, and clusters.' },
    { id: 'n_graph_edge', name: 'DependencyEdge', module: 'pipeline.graph.edge', cluster: 'c_graph', type: 'class', file: 'app/pipeline/graph/edge.py', line: 12, centrality: 0.72, isEntryPoint: false, tokenCount: 230, docstring: 'Edge representing import dependency or function call.' },
    { id: 'n_toposort', name: 'topological_sort()', module: 'pipeline.graph.algorithms', cluster: 'c_graph', type: 'function', file: 'app/pipeline/graph/algorithms.py', line: 48, centrality: 0.88, isEntryPoint: false, tokenCount: 360, docstring: 'Computes valid linear dependency order across modules.' },
    { id: 'n_cycle_detector', name: 'detect_cycles()', module: 'pipeline.graph.cycles', cluster: 'c_graph', type: 'function', file: 'app/pipeline/graph/cycles.py', line: 26, centrality: 0.64, isEntryPoint: false, tokenCount: 280, docstring: 'Tarjan algorithm for finding circular module imports.' },
    { id: 'n_pagerank', name: 'compute_pagerank()', module: 'pipeline.graph.pagerank', cluster: 'c_graph', type: 'function', file: 'app/pipeline/graph/pagerank.py', line: 62, centrality: 0.89, isEntryPoint: false, tokenCount: 410, docstring: 'Calculates node centrality scores based on incoming references.' },
    { id: 'n_cluster_louvain', name: 'LouvainCommunityDetector', module: 'pipeline.graph.clustering', cluster: 'c_graph', type: 'class', file: 'app/pipeline/graph/clustering.py', line: 31, centrality: 0.81, isEntryPoint: false, tokenCount: 520, docstring: 'Partitions dense code graph into 5-6 semantic clusters.' },
    { id: 'n_shortest_path', name: 'find_shortest_path()', module: 'pipeline.graph.paths', cluster: 'c_graph', type: 'function', file: 'app/pipeline/graph/paths.py', line: 20, centrality: 0.58, isEntryPoint: false, tokenCount: 210, docstring: 'Dijkstra search between two arbitrary symbols.' },
    { id: 'n_subgraph_extract', name: 'extract_neighborhood()', module: 'pipeline.graph.subgraph', cluster: 'c_graph', type: 'function', file: 'app/pipeline/graph/subgraph.py', line: 44, centrality: 0.67, isEntryPoint: false, tokenCount: 310, docstring: 'Extracts 2-hop ego network around selected query symbols.' },
    { id: 'n_graph_serial', name: 'serialize_graph()', module: 'pipeline.graph.serializer', cluster: 'c_graph', type: 'function', file: 'app/pipeline/graph/serializer.py', line: 18, centrality: 0.45, isEntryPoint: false, tokenCount: 190, docstring: 'Serializes graph structure to JSON for frontend canvas.' },
    { id: 'n_degree_calc', name: 'calculate_degrees()', module: 'pipeline.graph.degrees', cluster: 'c_graph', type: 'function', file: 'app/pipeline/graph/degrees.py', line: 15, centrality: 0.49, isEntryPoint: false, tokenCount: 140, docstring: 'Measures in-degree and out-degree connectivity.' },
    { id: 'n_deadcode_det', name: 'find_unreferenced_symbols()', module: 'pipeline.graph.deadcode', cluster: 'c_graph', type: 'function', file: 'app/pipeline/graph/deadcode.py', line: 32, centrality: 0.55, isEntryPoint: false, tokenCount: 250, docstring: 'Detects isolated components with 0 incoming citations.' },
    { id: 'n_module_hierarchy', name: 'ModuleHierarchyTree', module: 'pipeline.graph.tree', cluster: 'c_graph', type: 'class', file: 'app/pipeline/graph/tree.py', line: 28, centrality: 0.63, isEntryPoint: false, tokenCount: 280, docstring: 'Hierarchical filesystem tree representation.' },
    { id: 'n_bridge_detector', name: 'find_bridge_edges()', module: 'pipeline.graph.bridges', cluster: 'c_graph', type: 'function', file: 'app/pipeline/graph/bridges.py', line: 17, centrality: 0.51, isEntryPoint: false, tokenCount: 220, docstring: 'Identifies critical cross-cluster bottleneck couplings.' },
    { id: 'n_graph_diff', name: 'diff_graphs()', module: 'pipeline.graph.diff', cluster: 'c_graph', type: 'function', file: 'app/pipeline/graph/diff.py', line: 39, centrality: 0.47, isEntryPoint: false, tokenCount: 300, docstring: 'Compares graph versions across git commits.' },
    { id: 'n_adj_matrix', name: 'AdjacencyMatrix', module: 'pipeline.graph.matrix', cluster: 'c_graph', type: 'class', file: 'app/pipeline/graph/matrix.py', line: 21, centrality: 0.4, isEntryPoint: false, tokenCount: 180, docstring: 'Sparse numpy matrix for fast vectorized operations.' },
    { id: 'n_flow_analyzer', name: 'ControlFlowGraph', module: 'pipeline.graph.cfg', cluster: 'c_graph', type: 'class', file: 'app/pipeline/graph/cfg.py', line: 51, centrality: 0.66, isEntryPoint: false, tokenCount: 420, docstring: 'Intra-function branching and return point analysis.' },
    { id: 'n_transitive_close', name: 'transitive_closure()', module: 'pipeline.graph.closure', cluster: 'c_graph', type: 'function', file: 'app/pipeline/graph/closure.py', line: 14, centrality: 0.44, isEntryPoint: false, tokenCount: 160, docstring: 'Calculates all reachable downstream dependencies.' },
    { id: 'n_viz_layout', name: 'ForceDirectedLayout3D', module: 'pipeline.graph.layout', cluster: 'c_graph', type: 'class', file: 'app/pipeline/graph/layout.py', line: 65, centrality: 0.76, isEntryPoint: false, tokenCount: 490, docstring: 'Fruchterman-Reingold 3D coordinates optimizer.' },

    // c_indexer
    { id: 'n_evidence_idx', name: 'EvidenceIndex', module: 'pipeline.indexer.store', cluster: 'c_indexer', type: 'class', file: 'app/pipeline/indexer/store.py', line: 30, centrality: 0.93, isEntryPoint: false, tokenCount: 760, docstring: 'Deterministic index mapping symbol names to file:line spans.' },
    { id: 'n_line_citation', name: 'CitationBuilder', module: 'pipeline.indexer.citations', cluster: 'c_indexer', type: 'class', file: 'app/pipeline/indexer/citations.py', line: 19, centrality: 0.85, isEntryPoint: false, tokenCount: 340, docstring: 'Formats file:line snippet evidence blocks.' },
    { id: 'n_symbol_lookup', name: 'SymbolRegistry', module: 'pipeline.indexer.registry', cluster: 'c_indexer', type: 'class', file: 'app/pipeline/indexer/registry.py', line: 42, centrality: 0.87, isEntryPoint: false, tokenCount: 520, docstring: 'O(1) dictionary lookup by fully-qualified symbol path.' },
    { id: 'n_fuzzy_matcher', name: 'FuzzySymbolMatcher', module: 'pipeline.indexer.fuzzy', cluster: 'c_indexer', type: 'class', file: 'app/pipeline/indexer/fuzzy.py', line: 25, centrality: 0.64, isEntryPoint: false, tokenCount: 290, docstring: 'Levenshtein distance matcher for user query resolution.' },
    { id: 'n_bm25_retriever', name: 'BM25Retriever', module: 'analysis.retrieval.bm25', cluster: 'c_indexer', type: 'class', file: 'app/analysis/retrieval/bm25.py', line: 36, centrality: 0.79, isEntryPoint: false, tokenCount: 460, docstring: 'Lexical sparse search across docstrings and signatures.' },
    { id: 'n_hash_validator', name: 'ContentHashValidator', module: 'pipeline.indexer.validator', cluster: 'c_indexer', type: 'class', file: 'app/pipeline/indexer/validator.py', line: 15, centrality: 0.46, isEntryPoint: false, tokenCount: 180, docstring: 'Guarantees citation lines match exact source text.' },
    { id: 'n_snippet_cache', name: 'SnippetCache', module: 'pipeline.indexer.cache', cluster: 'c_indexer', type: 'class', file: 'app/pipeline/indexer/cache.py', line: 22, centrality: 0.52, isEntryPoint: false, tokenCount: 210, docstring: 'Pre-renders syntax-highlighted code snippets.' },
    { id: 'n_export_index', name: 'export_index_summary()', module: 'pipeline.indexer.export', cluster: 'c_indexer', type: 'function', file: 'app/pipeline/indexer/export.py', line: 33, centrality: 0.61, isEntryPoint: false, tokenCount: 260, docstring: 'Generates JSON summary of indexed symbols and LOC.' },
    { id: 'n_token_counter', name: 'TokenBudgetCounter', module: 'pipeline.indexer.tokens', cluster: 'c_indexer', type: 'class', file: 'app/pipeline/indexer/tokens.py', line: 28, centrality: 0.73, isEntryPoint: false, tokenCount: 310, docstring: 'Estimates tokenizer byte lengths for code snippets.' },
    { id: 'n_scope_resolver', name: 'ScopeResolutionIndex', module: 'pipeline.indexer.scope_idx', cluster: 'c_indexer', type: 'class', file: 'app/pipeline/indexer/scope_idx.py', line: 17, centrality: 0.58, isEntryPoint: false, tokenCount: 230, docstring: 'Resolves global vs module-local name collisions.' },
    { id: 'n_ast_line_index', name: 'ASTLineMap', module: 'pipeline.indexer.ast_lines', cluster: 'c_indexer', type: 'class', file: 'app/pipeline/indexer/ast_lines.py', line: 20, centrality: 0.69, isEntryPoint: false, tokenCount: 270, docstring: 'B-tree index linking every line number to deepest AST node.' },
    { id: 'n_doc_embedder', name: 'DocstringEmbedder', module: 'ai.embeddings.store', cluster: 'c_indexer', type: 'class', file: 'app/ai/embeddings/store.py', line: 40, centrality: 0.66, isEntryPoint: false, tokenCount: 380, docstring: 'Vector representation cache for semantic queries.' },
    { id: 'n_loc_calculator', name: 'count_effective_loc()', module: 'pipeline.indexer.metrics', cluster: 'c_indexer', type: 'function', file: 'app/pipeline/indexer/metrics.py', line: 12, centrality: 0.35, isEntryPoint: false, tokenCount: 140, docstring: 'Calculates non-blank non-comment lines of code.' },
    { id: 'n_citation_verifier', name: 'verify_citation_bounds()', module: 'pipeline.indexer.bounds', cluster: 'c_indexer', type: 'function', file: 'app/pipeline/indexer/bounds.py', line: 16, centrality: 0.48, isEntryPoint: false, tokenCount: 190, docstring: 'Verifies line numbers do not exceed total file lines.' },
    { id: 'n_multi_file_idx', name: 'MultiFileRegistry', module: 'pipeline.indexer.multi', cluster: 'c_indexer', type: 'class', file: 'app/pipeline/indexer/multi.py', line: 31, centrality: 0.54, isEntryPoint: false, tokenCount: 240, docstring: 'Aggregate index across root modules and packages.' },
    { id: 'n_search_prefix', name: 'PrefixTrieSearch', module: 'pipeline.indexer.trie', cluster: 'c_indexer', type: 'class', file: 'app/pipeline/indexer/trie.py', line: 24, centrality: 0.43, isEntryPoint: false, tokenCount: 170, docstring: 'Radix trie for instant autocompletion in command bar.' },

    // c_reasoning
    { id: 'n_reader_order', name: 'compute_reading_order()', module: 'analysis.reader_order.order', cluster: 'c_reasoning', type: 'function', file: 'app/analysis/reader_order/order.py', line: 32, centrality: 0.91, isEntryPoint: true, tokenCount: 710, docstring: 'Determines optimal sequential progression for onboarding.' },
    { id: 'n_plan_verifier', name: 'PlanVerifier', module: 'analysis.plan_checks.verifier', cluster: 'c_reasoning', type: 'class', file: 'app/analysis/plan_checks/verifier.py', line: 45, centrality: 0.92, isEntryPoint: true, tokenCount: 820, docstring: 'Validates roadmap milestones against real code evidence.' },
    { id: 'n_context_packer', name: 'ContextPacker', module: 'analysis.packer.packer', cluster: 'c_reasoning', type: 'class', file: 'app/analysis/packer/packer.py', line: 38, centrality: 0.89, isEntryPoint: true, tokenCount: 740, docstring: 'Assembles compact token-budgeted prompt contexts.' },
    { id: 'n_intent_router', name: 'route_query_intent()', module: 'ai.router.classifier', cluster: 'c_reasoning', type: 'function', file: 'app/ai/router/classifier.py', line: 22, centrality: 0.86, isEntryPoint: false, tokenCount: 390, docstring: 'Classifies queries into Reader, Plan, or Context modes.' },
    { id: 'n_prompt_builder', name: 'PromptTemplateManager', module: 'ai.prompts.manager', cluster: 'c_reasoning', type: 'class', file: 'app/ai/prompts/manager.py', line: 19, centrality: 0.74, isEntryPoint: false, tokenCount: 350, docstring: 'Injects verified citations into model system prompts.' },
    { id: 'n_evidence_verifier', name: 'DeterministicEvidenceCheck', module: 'analysis.plan_checks.evidence', cluster: 'c_reasoning', type: 'class', file: 'app/analysis/plan_checks/evidence.py', line: 29, centrality: 0.8, isEntryPoint: false, tokenCount: 460, docstring: 'Enforces hard design rule: AI never invents citations.' },
    { id: 'n_hallucination_guard', name: 'HallucinationGuard', module: 'ai.guardrails.verify', cluster: 'c_reasoning', type: 'class', file: 'app/ai/guardrails/verify.py', line: 33, centrality: 0.77, isEntryPoint: false, tokenCount: 410, docstring: 'Cross-checks generated explanations against code AST.' },
    { id: 'n_token_budget_alloc', name: 'allocate_tier_budget()', module: 'analysis.packer.budget', cluster: 'c_reasoning', type: 'function', file: 'app/analysis/packer/budget.py', line: 24, centrality: 0.7, isEntryPoint: false, tokenCount: 310, docstring: 'Divides token allowance between full bodies and signatures.' },
    { id: 'n_summary_synth', name: 'synthesize_summary()', module: 'ai.prompts.synth', cluster: 'c_reasoning', type: 'function', file: 'app/ai/prompts/synth.py', line: 15, centrality: 0.65, isEntryPoint: false, tokenCount: 290, docstring: 'Produces crisp human-readable architectural summaries.' },
    { id: 'n_mermaid_generator', name: 'generate_mermaid_flow()', module: 'analysis.reader_order.mermaid', cluster: 'c_reasoning', type: 'function', file: 'app/analysis/reader_order/mermaid.py', line: 40, centrality: 0.62, isEntryPoint: false, tokenCount: 280, docstring: 'Generates 2D Mermaid diagram representation.' },
    { id: 'n_agent_trace_log', name: 'AgentTraceLogger', module: 'agent.trace', cluster: 'c_reasoning', type: 'class', file: 'app/agent/trace.py', line: 20, centrality: 0.58, isEntryPoint: false, tokenCount: 240, docstring: 'Logs step-by-step reasoning decisions with citations.' },
    { id: 'n_eval_suite', name: 'PlanEvalSuite', module: 'evals.plan_verifier', cluster: 'c_reasoning', type: 'class', file: 'evals/plan_verifier/suite.py', line: 35, centrality: 0.5, isEntryPoint: false, tokenCount: 320, docstring: 'Benchmark harness for plan item recall and accuracy.' },
    { id: 'n_confidence_scorer', name: 'calculate_confidence()', module: 'analysis.plan_checks.confidence', cluster: 'c_reasoning', type: 'function', file: 'app/analysis/plan_checks/confidence.py', line: 18, centrality: 0.56, isEntryPoint: false, tokenCount: 210, docstring: 'Scores evidence completeness from 0.0 to 1.0.' },
    { id: 'n_citation_dedup', name: 'deduplicate_citations()', module: 'analysis.retrieval.dedup', cluster: 'c_reasoning', type: 'function', file: 'app/analysis/retrieval/dedup.py', line: 11, centrality: 0.44, isEntryPoint: false, tokenCount: 150, docstring: 'Collapses contiguous line citations into ranges.' },
  ];

  // Distribute nodes organically in 3D around cluster centers
  const clusterMap = new Map(MOCK_CLUSTERS.map(c => [c.id, c]));
  const clusterCounters: Record<string, number> = {};

  rawNodeDefs.forEach(def => {
    const cluster = clusterMap.get(def.cluster) || MOCK_CLUSTERS[0];
    const idx = (clusterCounters[def.cluster] = (clusterCounters[def.cluster] || 0) + 1);
    
    // Golden spiral offset around cluster center
    const phi = Math.acos(-1 + (2 * idx) / cluster.nodeCount);
    const theta = Math.sqrt(cluster.nodeCount * Math.PI) * phi;
    const radius = 3.5 + (idx % 3) * 1.8;

    const x = cluster.center[0] + radius * Math.cos(theta) * Math.sin(phi);
    const y = cluster.center[1] + radius * Math.sin(theta) * Math.sin(phi);
    const z = cluster.center[2] + radius * Math.cos(phi);

    nodes.push({
      ...def,
      position: [Number(x.toFixed(2)), Number(y.toFixed(2)), Number(z.toFixed(2))],
      connections: [],
    });
  });

  // Create realistic dependency graph edges
  const edgeDefs: Array<[string, string, 'import' | 'call' | 'inheritance', number]> = [
    // Gateway -> Core
    ['n_main', 'n_orchestrator', 'call', 0.9],
    ['n_main', 'n_config_mgr', 'import', 0.8],
    ['n_main', 'n_auth_router', 'import', 0.85],
    ['n_main', 'n_repos_router', 'import', 0.85],
    ['n_main', 'n_cors', 'call', 0.5],
    ['n_auth_router', 'n_login_handler', 'call', 0.8],
    ['n_login_handler', 'n_jwt_signer', 'call', 0.75],
    ['n_login_handler', 'n_hasher', 'call', 0.7],
    ['n_repos_router', 'n_create_repo', 'call', 0.8],
    ['n_repos_router', 'n_owned_dep', 'call', 0.7],
    ['n_create_repo', 'n_schema_repo', 'import', 0.6],

    // Core -> Parser & Indexer
    ['n_orchestrator', 'n_git_sandbox', 'call', 0.85],
    ['n_orchestrator', 'n_ast_visitor', 'call', 0.9],
    ['n_orchestrator', 'n_code_graph', 'call', 0.95],
    ['n_orchestrator', 'n_evidence_idx', 'call', 0.9],
    ['n_git_sandbox', 'n_repo_cache', 'call', 0.7],
    ['n_git_sandbox', 'n_file_filter', 'call', 0.65],

    // Parser internals
    ['n_ast_visitor', 'n_tree_sitter', 'import', 0.8],
    ['n_ast_visitor', 'n_import_resolver', 'call', 0.85],
    ['n_ast_visitor', 'n_symbol_extractor', 'call', 0.8],
    ['n_ast_visitor', 'n_line_mapper', 'call', 0.75],
    ['n_symbol_extractor', 'n_docstring_parser', 'call', 0.6],
    ['n_symbol_extractor', 'n_call_analyzer', 'call', 0.7],

    // Graph internals
    ['n_code_graph', 'n_toposort', 'call', 0.88],
    ['n_code_graph', 'n_pagerank', 'call', 0.85],
    ['n_code_graph', 'n_cluster_louvain', 'call', 0.82],
    ['n_code_graph', 'n_cycle_detector', 'call', 0.7],
    ['n_code_graph', 'n_shortest_path', 'call', 0.6],
    ['n_code_graph', 'n_subgraph_extract', 'call', 0.75],

    // Indexer internals
    ['n_evidence_idx', 'n_line_citation', 'call', 0.88],
    ['n_evidence_idx', 'n_symbol_lookup', 'call', 0.85],
    ['n_evidence_idx', 'n_bm25_retriever', 'call', 0.78],
    ['n_evidence_idx', 'n_token_counter', 'call', 0.72],
    ['n_evidence_idx', 'n_ast_line_index', 'call', 0.7],

    // Reasoning connections
    ['n_reader_order', 'n_code_graph', 'call', 0.9],
    ['n_reader_order', 'n_toposort', 'call', 0.85],
    ['n_reader_order', 'n_line_citation', 'call', 0.8],
    ['n_reader_order', 'n_mermaid_generator', 'call', 0.75],
    ['n_plan_verifier', 'n_evidence_idx', 'call', 0.92],
    ['n_plan_verifier', 'n_evidence_verifier', 'call', 0.88],
    ['n_plan_verifier', 'n_bm25_retriever', 'call', 0.82],
    ['n_context_packer', 'n_subgraph_extract', 'call', 0.85],
    ['n_context_packer', 'n_token_budget_alloc', 'call', 0.88],
    ['n_context_packer', 'n_evidence_idx', 'call', 0.82],
    ['n_intent_router', 'n_reader_order', 'call', 0.7],
    ['n_intent_router', 'n_plan_verifier', 'call', 0.7],
    ['n_intent_router', 'n_context_packer', 'call', 0.7],
  ];

  edgeDefs.forEach(([src, dst, type, weight], index) => {
    edges.push({
      id: `e_${index}`,
      source: src,
      target: dst,
      type,
      weight,
    });
    // Record bidirectional connectivity for node highlight lookups
    const srcNode = nodes.find(n => n.id === src);
    const dstNode = nodes.find(n => n.id === dst);
    if (srcNode && !srcNode.connections.includes(dst)) srcNode.connections.push(dst);
    if (dstNode && !dstNode.connections.includes(src)) dstNode.connections.push(src);
  });

  return { nodes, edges, clusters: MOCK_CLUSTERS };
}

export const MOCK_GALAXY_GRAPH: GalaxyGraph = generateGalaxyGraph();

export const MOCK_READER_RESPONSE: ReaderResponse = {
  mode: 'reader',
  query: 'Where do I start reading this codebase to understand repository ingestion?',
  summary: 'RepoTrackr AI follows a deterministic ingest-then-reason architecture. The ingestion pipeline begins at the FastAPI application factory, initializes the shallow git clone sandbox, passes raw files to the AST visitor and code graph builder, and stores the line citation index before any AI inference takes place.',
  readingOrder: [
    {
      step: 1,
      nodeId: 'n_main',
      title: 'Application Bootstrap & Lifespan',
      file: 'app/main.py',
      line: 34,
      explanation: 'Start here. The create_app() factory boots settings, registers error middleware, sets up slowapi rate limiters, and mounts the feature routers.',
      codeSnippet: `def create_app() -> FastAPI:\n    settings = get_settings()\n    app = FastAPI(title=settings.APP_NAME)\n    app.state.limiter = limiter\n    app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS)\n    app.include_router(auth_router)\n    app.include_router(repos_router)\n    return app`,
    },
    {
      step: 2,
      nodeId: 'n_repos_router',
      title: 'Repository Registration & URL Validation',
      file: 'app/features/repos/router.py',
      line: 21,
      explanation: 'Incoming GitHub links are normalized to lowercased https://github.com/owner/name and verified against the per-user uniqueness constraint before scheduling background work.',
      codeSnippet: `@router.post("", response_model=RepoOut, status_code=201)\ndef create_repo(payload: RepoCreate, current_user: User = Depends(get_current_user)):\n    owner, name = parse_github_url(payload.url)\n    url = f"https://{GITHUB_HOST}/{owner.lower()}/{name.lower()}"\n    repo = Repo(user_id=current_user.id, url=url, status="added")\n    db.add(repo)\n    db.commit()\n    return repo`,
    },
    {
      step: 3,
      nodeId: 'n_orchestrator',
      title: 'Pipeline Ingestion Orchestration',
      file: 'app/pipeline/orchestrator.py',
      line: 28,
      explanation: 'PipelineOrchestrator coordinates the 4 deterministic stages: cloning the git repository into a safe temporary sandbox, generating the AST syntax trees, compiling the dependency graph, and indexing lines.',
      codeSnippet: `class PipelineOrchestrator:\n    async def process_repo(self, repo_id: int, url: str) -> IndexResult:\n        async with GitSandbox(url) as sandbox:\n            modules = await ModuleVisitor().parse_tree(sandbox.path)\n            graph = CodeGraph.build_from_modules(modules)\n            index = EvidenceIndex.generate(modules, graph)\n            return IndexResult(graph=graph, index=index)`,
    },
    {
      step: 4,
      nodeId: 'n_ast_visitor',
      title: 'Deterministic AST Visitor & Symbol Mapping',
      file: 'app/pipeline/chunking/ast_visitor.py',
      line: 42,
      explanation: 'Recursively visits Python AST ClassDef and FunctionDef nodes, computing precise 1-indexed line spans and recording relative import targets.',
      codeSnippet: `class ModuleVisitor(ast.NodeVisitor):\n    def visit_FunctionDef(self, node: ast.FunctionDef):\n        symbol = Symbol(name=node.name, start_line=node.lineno, end_line=node.end_lineno)\n        self.symbols.append(symbol)\n        self.generic_visit(node)`,
    },
    {
      step: 5,
      nodeId: 'n_code_graph',
      title: 'DAG Compilation & Centrality Ranking',
      file: 'app/pipeline/graph/builder.py',
      line: 35,
      explanation: 'Builds directed adjacency relationships between modules. Computes PageRank centrality to determine entry points and Louvain community clusters.',
      codeSnippet: `class CodeGraph:\n    def compute_centrality(self) -> dict[str, float]:\n        # PageRank with damping factor 0.85\n        return pagerank(self.adjacency, alpha=0.85)`,
    },
    {
      step: 6,
      nodeId: 'n_evidence_idx',
      title: 'file:line Evidence Citation Registry',
      file: 'app/pipeline/indexer/store.py',
      line: 30,
      explanation: 'Stores exact file:line offset bounds. When the AI explains architecture, every claim is anchored to a verified row in this registry.',
      codeSnippet: `class EvidenceIndex:\n    def get_citation(self, symbol_id: str) -> Citation:\n        entry = self.registry[symbol_id]\n        snippet = self.read_span(entry.file, entry.start_line, entry.end_line)\n        return Citation(file=entry.file, line=entry.start_line, snippet=snippet)`,
    },
  ],
  citations: [
    { file: 'app/main.py', line: 34, symbol: 'create_app', snippet: 'app = FastAPI(title=settings.APP_NAME)' },
    { file: 'app/features/repos/router.py', line: 21, symbol: 'create_repo', snippet: 'owner, name = parse_github_url(payload.url)' },
    { file: 'app/pipeline/orchestrator.py', line: 28, symbol: 'PipelineOrchestrator', snippet: 'class PipelineOrchestrator:\n    async def process_repo(...)' },
    { file: 'app/pipeline/chunking/ast_visitor.py', line: 42, symbol: 'ModuleVisitor', snippet: 'class ModuleVisitor(ast.NodeVisitor):' },
    { file: 'app/pipeline/graph/builder.py', line: 35, symbol: 'CodeGraph', snippet: 'class CodeGraph:\n    def compute_centrality(...)' },
    { file: 'app/pipeline/indexer/store.py', line: 30, symbol: 'EvidenceIndex', snippet: 'class EvidenceIndex:\n    def get_citation(...)' },
  ],
  mermaidDiagram: `graph TD
    A[main.py: create_app] --> B[features/repos/router.py: create_repo]
    B --> C[pipeline/orchestrator.py: PipelineOrchestrator]
    C --> D[chunking/ast_visitor.py: ModuleVisitor]
    D --> E[graph/builder.py: CodeGraph]
    E --> F[indexer/store.py: EvidenceIndex]
    style A fill:#7C93FF,stroke:#3B5BFF,stroke-width:2px,color:#fff
    style C fill:#FBBF24,stroke:#D97706,stroke-width:2px,color:#fff
    style F fill:#34D399,stroke:#059669,stroke-width:2px,color:#fff`,
};

export const MOCK_PLAN_RESPONSE: PlanResponse = {
  mode: 'plan',
  query: 'Verify roadmap items against codebase implementation',
  summary: 'Evaluated 6 roadmap deliverables against the repository evidence index. 3 items are fully verified (done), 1 is in progress (partial), 1 is not implemented yet (missing), and 1 cannot be confirmed without live external credentials (unknown).',
  items: [
    {
      id: 'plan_1',
      title: 'Email & Password Authentication with JWT and Verification',
      status: 'done',
      description: 'Signup, verify-email, login, refresh, password reset, and /auth/me endpoints are implemented with Argon2-id password hashing and HS256 tokens.',
      nodeIds: ['n_auth_router', 'n_login_handler', 'n_jwt_signer', 'n_hasher'],
      evidence: ['app/features/auth/router.py:53', 'app/security/tokens.py:34', 'app/security/passwords.py:8'],
      angle: 0,
    },
    {
      id: 'plan_2',
      title: 'Repository Registration & Duplicate URL Blocking',
      status: 'done',
      description: 'GitHub URL validation with case-insensitive normalization (owner and name stored lowercased) and per-user unique constraints.',
      nodeIds: ['n_repos_router', 'n_create_repo', 'n_schema_repo'],
      evidence: ['app/features/repos/router.py:21', 'app/schemas/repo.py:48'],
      angle: (2 * Math.PI) / 6,
    },
    {
      id: 'plan_3',
      title: 'Deterministic AST Visitor & Symbol Bounds Indexer',
      status: 'done',
      description: 'Python syntax tree visitor extracting class and function boundaries with 1-indexed file:line spans.',
      nodeIds: ['n_ast_visitor', 'n_symbol_extractor', 'n_line_mapper'],
      evidence: ['app/pipeline/chunking/ast_visitor.py:42', 'app/pipeline/chunking/symbols.py:22'],
      angle: (4 * Math.PI) / 6,
    },
    {
      id: 'plan_4',
      title: 'Call & Import Dependency Graph with Centrality Scoring',
      status: 'partial',
      description: 'Directed graph builder and PageRank centrality ranking are implemented; Louvain cluster partitioning is currently being calibrated.',
      nodeIds: ['n_code_graph', 'n_pagerank', 'n_cluster_louvain'],
      evidence: ['app/pipeline/graph/builder.py:35', 'app/pipeline/graph/pagerank.py:62'],
      angle: (6 * Math.PI) / 6,
    },
    {
      id: 'plan_5',
      title: 'Automated Containerized Shallow Git Clone Sandbox',
      status: 'missing',
      description: 'Git clone sandbox is currently registered as a stub interface; real git subprocess execution with timeout and disk quotas is not yet connected.',
      nodeIds: ['n_git_sandbox'],
      evidence: ['app/features/indexing/router.py:9'],
      angle: (8 * Math.PI) / 6,
    },
    {
      id: 'plan_6',
      title: 'SMTP Production Email Relay Integration',
      status: 'unknown',
      description: 'Config options exist in settings, but dev fallback prints tokens to console. Production SMTP connection cannot be deterministically verified offline.',
      nodeIds: ['n_config_mgr'],
      evidence: ['app/core/config.py:37'],
      angle: (10 * Math.PI) / 6,
    },
  ],
  citations: [
    { file: 'app/features/auth/router.py', line: 53, symbol: 'auth_router', snippet: 'router = APIRouter(prefix="/auth", tags=["auth"])' },
    { file: 'app/features/repos/router.py', line: 21, symbol: 'create_repo', snippet: 'def create_repo(payload: RepoCreate...):' },
    { file: 'app/pipeline/chunking/ast_visitor.py', line: 42, symbol: 'ModuleVisitor', snippet: 'class ModuleVisitor(ast.NodeVisitor):' },
    { file: 'app/pipeline/graph/builder.py', line: 35, symbol: 'CodeGraph', snippet: 'class CodeGraph:\n    def build_from_modules(...)' },
  ],
};

export const MOCK_CONTEXT_RESPONSE: ContextResponse = {
  mode: 'context',
  query: 'Add a new rate limiter endpoint for repository re-indexing',
  totalTokens: 1420,
  budgetLimit: 2048,
  packedNodes: [
    {
      nodeId: 'n_ratelimit',
      tier: 'full',
      tokens: 280,
      file: 'app/core/ratelimit.py',
      line: 12,
      reason: 'Essential dependency: Contains the Limiter instance configuration and key_func=get_remote_address.',
    },
    {
      nodeId: 'n_repos_router',
      tier: 'full',
      tokens: 490,
      file: 'app/features/repos/router.py',
      line: 14,
      reason: 'Target extension point: Target router where the re-index route will be mounted.',
    },
    {
      nodeId: 'n_owned_dep',
      tier: 'signature',
      tokens: 140,
      file: 'app/features/repos/dependencies.py',
      line: 18,
      reason: 'Signature tier: Dependency declaration def get_owned_repo(repo_id: int) -> Repo.',
    },
    {
      nodeId: 'n_orchestrator',
      tier: 'signature',
      tokens: 210,
      file: 'app/pipeline/orchestrator.py',
      line: 28,
      reason: 'Signature tier: Trigger method signature async def process_repo(repo_id: int).',
    },
    {
      nodeId: 'n_config_mgr',
      tier: 'signature',
      tokens: 300,
      file: 'app/core/config.py',
      line: 12,
      reason: 'Signature tier: Settings definitions for RATE_LIMIT_INDEXING env parameter.',
    },
  ],
  markdownContext: `### Code Context Pack (1,420 tokens / 2,048 budget)

#### 1. app/core/ratelimit.py (Lines 12–25) [TIER: FULL]
\`\`\`python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
\`\`\`

#### 2. app/features/repos/router.py (Lines 14–35) [TIER: FULL]
\`\`\`python
from fastapi import APIRouter, Depends, HTTPException, status
from app.features.repos.dependencies import get_owned_repo
from app.models.repo import Repo

router = APIRouter(prefix="/repos", tags=["repos"])
\`\`\`

#### 3. app/features/repos/dependencies.py (Signature) [TIER: SIGNATURE]
\`\`\`python
def get_owned_repo(repo_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Repo: ...
\`\`\`

#### 4. app/pipeline/orchestrator.py (Signature) [TIER: SIGNATURE]
\`\`\`python
class PipelineOrchestrator:
    async def process_repo(self, repo_id: int, url: str) -> IndexResult: ...
\`\`\``,
  efficientPrompt: `You are extending RepoTrackr AI. Implement POST /repos/{repo_id}/reindex with per-IP rate limiting:
1. Apply @limiter.limit("3/minute") to prevent worker pool saturation.
2. Require get_owned_repo to enforce ownership isolation.
3. Call PipelineOrchestrator().process_repo() in a BackgroundTasks hook.
4. Return 202 Accepted with {"status": "queued"}.`,
  citations: [
    { file: 'app/core/ratelimit.py', line: 12, symbol: 'limiter', snippet: 'limiter = Limiter(key_func=get_remote_address)' },
    { file: 'app/features/repos/router.py', line: 14, symbol: 'repos_router', snippet: 'router = APIRouter(prefix="/repos", tags=["repos"])' },
    { file: 'app/features/repos/dependencies.py', line: 18, symbol: 'get_owned_repo', snippet: 'def get_owned_repo(...)' },
  ],
};

export const MOCK_INDEX_STATUS_COMPLETED: RepoIndexStatus = {
  status: 'ready',
  progress: 100,
  nodeCount: MOCK_GALAXY_GRAPH.nodes.length,
  edgeCount: MOCK_GALAXY_GRAPH.edges.length,
  lastIndexedAt: new Date().toISOString(),
  stages: [
    { id: 'clone', label: 'Git Clone Sandbox', description: 'Shallow cloned repository into isolated memory filesystem', progress: 100, status: 'completed' },
    { id: 'parse', label: 'AST & Token Parsing', description: 'Extracted 78 Python AST symbols and boundary line spans', progress: 100, status: 'completed' },
    { id: 'graph', label: 'Dependency Graph Compilation', description: 'Compiled directed call graph and 6 Louvain module clusters', progress: 100, status: 'completed' },
    { id: 'index', label: 'file:line Evidence Indexing', description: 'Indexed 100% of symbol definitions with verified line citations', progress: 100, status: 'completed' },
  ],
};
