import { api } from './client';
import {
  GalaxyGraph,
  RepoIndexStatus,
  QueryResponse,
  ReaderResponse,
  PlanResponse,
  ContextResponse,
} from '../types/galaxy';
import {
  MOCK_GALAXY_GRAPH,
  MOCK_READER_RESPONSE,
  MOCK_PLAN_RESPONSE,
  MOCK_CONTEXT_RESPONSE,
  MOCK_INDEX_STATUS_COMPLETED,
} from '../mock/galaxyData';

export const USE_MOCK = true;

export interface GalaxyResult<T> {
  data: T;
  isDemoData: boolean;
  sourceStatus: number;
}

export async function getGalaxyGraph(repoId: number | string): Promise<GalaxyResult<GalaxyGraph>> {
  // Call real endpoint GET /repos/:id/index/summary to test status
  const res = await api.request(`/repos/${repoId}/index/summary`);
  if (!USE_MOCK && res.ok && res.data) {
    return { data: res.data, isDemoData: false, sourceStatus: res.status };
  }
  return {
    data: MOCK_GALAXY_GRAPH,
    isDemoData: true,
    sourceStatus: res.status || 501,
  };
}

export async function getIndexStatus(repoId: number | string): Promise<GalaxyResult<RepoIndexStatus>> {
  const res = await api.request(`/repos/${repoId}/index/status`);
  if (!USE_MOCK && res.ok && res.data) {
    return { data: res.data, isDemoData: false, sourceStatus: res.status };
  }
  return {
    data: MOCK_INDEX_STATUS_COMPLETED,
    isDemoData: true,
    sourceStatus: res.status || 501,
  };
}

export async function startIndexing(repoId: number | string): Promise<GalaxyResult<{ status: string }>> {
  const res = await api.request(`/repos/${repoId}/index`, { method: 'POST' });
  return {
    data: { status: 'indexing_started' },
    isDemoData: res.status === 501 || !res.ok,
    sourceStatus: res.status || 501,
  };
}

export async function runGalaxyQuery(
  repoId: number | string,
  query: string,
  explicitMode?: 'reader' | 'plan' | 'context'
): Promise<GalaxyResult<QueryResponse>> {
  const qLower = query.toLowerCase();

  let targetMode: 'reader' | 'plan' | 'context' = explicitMode || 'reader';
  if (!explicitMode) {
    if (qLower.includes('start') || qLower.includes('how does') || qLower.includes('where') || qLower.includes('read')) {
      targetMode = 'reader';
    } else if (qLower.includes('left') || qLower.includes('done') || qLower.includes('plan') || qLower.includes('roadmap') || qLower.includes('verify')) {
      targetMode = 'plan';
    } else if (qLower.includes('add') || qLower.includes('build') || qLower.includes('implement') || qLower.includes('pack') || qLower.includes('token') || qLower.includes('context')) {
      targetMode = 'context';
    }
  }

  // Call real backend route POST /repos/:id/query
  const res = await api.request(`/repos/${repoId}/query`, {
    method: 'POST',
    body: JSON.stringify({ query, mode: targetMode }),
  });

  if (!USE_MOCK && res.ok && res.data && res.status !== 501) {
    return { data: res.data, isDemoData: false, sourceStatus: res.status };
  }

  // Graceful typed mock fallback
  let fallbackData: QueryResponse;
  if (targetMode === 'reader') {
    fallbackData = { ...MOCK_READER_RESPONSE, query };
  } else if (targetMode === 'plan') {
    fallbackData = { ...MOCK_PLAN_RESPONSE, query };
  } else {
    fallbackData = { ...MOCK_CONTEXT_RESPONSE, query };
  }

  return {
    data: fallbackData,
    isDemoData: true,
    sourceStatus: res.status || 501,
  };
}

export async function getPlanVerification(repoId: number | string): Promise<GalaxyResult<PlanResponse>> {
  const res = await api.request(`/repos/${repoId}/plan`);
  return {
    data: MOCK_PLAN_RESPONSE,
    isDemoData: true,
    sourceStatus: res.status || 501,
  };
}

export async function getReaderGuide(repoId: number | string): Promise<GalaxyResult<ReaderResponse>> {
  const res = await api.request(`/repos/${repoId}/reader`);
  return {
    data: MOCK_READER_RESPONSE,
    isDemoData: true,
    sourceStatus: res.status || 501,
  };
}

export async function getEvalsSummary(): Promise<GalaxyResult<any>> {
  const res = await api.request('/evals');
  return {
    data: {
      status: 'benchmark_suite_ready',
      testCases: 42,
      accuracy: 0.96,
      citationRecall: 1.0,
      hallucinationRate: 0.0,
    },
    isDemoData: true,
    sourceStatus: res.status || 501,
  };
}
