import React, { useState, useEffect } from 'react';
import { Terminal, Shield, CheckCircle2, AlertTriangle, RefreshCw, Trash2, Code, ArrowUpRight } from 'lucide-react';
import { api, ApiLogEntry } from '../../api/client';

export const DeveloperPage: React.FC = () => {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<ApiLogEntry | null>(null);

  useEffect(() => {
    setLogs(api.getLogs());
    const unsubscribe = api.subscribeLogs(() => {
      setLogs(api.getLogs());
    });
    return unsubscribe;
  }, []);

  const endpoints = [
    { method: 'POST', path: '/auth/signup', tag: 'Auth', status: 201, implemented: true, desc: 'Register new user account' },
    { method: 'POST', path: '/auth/verify-email', tag: 'Auth', status: 200, implemented: true, desc: 'Verify email with SHA-256 token' },
    { method: 'POST', path: '/auth/login', tag: 'Auth', status: 200, implemented: true, desc: 'Authenticate credentials & issue JWT pair' },
    { method: 'POST', path: '/auth/refresh', tag: 'Auth', status: 200, implemented: true, desc: 'Refresh expired access token' },
    { method: 'GET', path: '/auth/me', tag: 'Auth', status: 200, implemented: true, desc: 'Retrieve authenticated profile' },
    { method: 'POST', path: '/repos', tag: 'Repos', status: 201, implemented: true, desc: 'Add repository URL with duplicate protection' },
    { method: 'GET', path: '/repos', tag: 'Repos', status: 200, implemented: true, desc: 'List current user repositories' },
    { method: 'GET', path: '/repos/{id}', tag: 'Repos', status: 200, implemented: true, desc: 'Get repository details with ownership check' },
    { method: 'DELETE', path: '/repos/{id}', tag: 'Repos', status: 200, implemented: true, desc: 'Delete repository record' },
    { method: 'POST', path: '/repos/{id}/index', tag: 'Pipeline', status: 501, implemented: false, desc: 'Start ingestion pipeline (Stub)' },
    { method: 'GET', path: '/repos/{id}/index/status', tag: 'Pipeline', status: 501, implemented: false, desc: 'Fetch indexing stages (Stub)' },
    { method: 'GET', path: '/repos/{id}/plan', tag: 'AI Reasoning', status: 501, implemented: false, desc: 'Upload roadmap & verify milestones (Stub)' },
    { method: 'GET', path: '/repos/{id}/reader', tag: 'AI Reasoning', status: 501, implemented: false, desc: 'Compute topological reading order (Stub)' },
    { method: 'POST', path: '/repos/{id}/context', tag: 'AI Reasoning', status: 501, implemented: false, desc: 'Pack context within token budget (Stub)' },
    { method: 'POST', path: '/repos/{id}/query', tag: 'AI Reasoning', status: 501, implemented: false, desc: 'Natural language query intent router (Stub)' },
    { method: 'GET', path: '/repos/{id}/agent/trace', tag: 'Agent', status: 501, implemented: false, desc: 'Step-by-step agent execution trace (Stub)' },
    { method: 'GET', path: '/evals', tag: 'Evals', status: 501, implemented: false, desc: 'Benchmark suite metrics (Stub)' },
  ];

  const methodColors: Record<string, string> = {
    GET: 'bg-[#DCFCE7] text-[#16A34A]',
    POST: 'bg-[#E0F2FE] text-[#0284C7]',
    DELETE: 'bg-[#FEE2E2] text-[#EF4444]',
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E8ECFF] text-[#3B5BFF] flex items-center justify-center font-bold">
            <Terminal className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1020]">Developer Console</h1>
        </div>
        <p className="text-sm text-[#5B6478] mt-1.5">
          Live API contract specifications, Part 2–4 stubs status, and real-time request activity logs.
        </p>
      </div>

      {/* Endpoint Matrix */}
      <div className="bg-white rounded-2xl border border-[#E4E7EF] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E4E7EF] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#0B1020]">API Contract Endpoints</h3>
            <p className="text-xs text-[#5B6478] mt-0.5">
              Part 1 endpoints are fully live; Part 2–4 stubs enforce auth/404 then return 501.
            </p>
          </div>
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F6F7FB] text-[#0B1020] border border-[#E4E7EF]">
            {endpoints.length} routes registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F7FB] border-b border-[#E4E7EF] font-bold text-[#5B6478]">
              <tr>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Endpoint Path</th>
                <th className="py-3 px-4">Scope</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Implementation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EF]">
              {endpoints.map((ep, idx) => (
                <tr key={idx} className="hover:bg-[#F6F7FB]/50 transition-colors">
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        methodColors[ep.method] || 'bg-[#F1F5F9] text-[#64748B]'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0B1020]">{ep.path}</td>
                  <td className="py-3 px-4 text-[#5B6478]">{ep.tag}</td>
                  <td className="py-3 px-4 text-[#5B6478]">{ep.desc}</td>
                  <td className="py-3 px-4 text-right">
                    {ep.implemented ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A34A]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Live (HTTP {ep.status})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D97706]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Stub (501 not_implemented)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live API Activity Inspector */}
      <div className="bg-white rounded-2xl border border-[#E4E7EF] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E4E7EF] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#0B1020]">Live API Activity Inspector</h3>
            <p className="text-xs text-[#5B6478] mt-0.5">
              Real-time monitoring of all network calls, status codes, and latency.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="text-xs font-mono text-[#5B6478]">{logs.length} calls recorded</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#E4E7EF]">
          {/* Logs List */}
          <div className="lg:col-span-2 max-h-[420px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#5B6478]">
                No API requests recorded in this session yet. Perform an action in the app to view live traces.
              </div>
            ) : (
              <div className="divide-y divide-[#E4E7EF]">
                {logs.map(log => {
                  const isSelected = selectedLog?.id === log.id;
                  const isSuccess = log.status >= 200 && log.status < 300;
                  const is501 = log.status === 501;

                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`p-3.5 flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#E8ECFF]/50' : 'hover:bg-[#F6F7FB]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                            methodColors[log.method] || 'bg-gray-100'
                          }`}
                        >
                          {log.method}
                        </span>
                        <span className="font-mono text-[#0B1020] truncate">{log.url}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                        <span
                          className={`font-bold ${
                            isSuccess
                              ? 'text-[#16A34A]'
                              : is501
                              ? 'text-[#D97706]'
                              : 'text-[#EF4444]'
                          }`}
                        >
                          HTTP {log.status}
                        </span>
                        <span className="text-[#94A3B8]">{log.durationMs}ms</span>
                        <span className="text-[#94A3B8]">{log.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Log Detail Inspector */}
          <div className="p-4 bg-[#F6F7FB]/50 max-h-[420px] overflow-y-auto">
            <h4 className="font-bold text-xs text-[#0B1020] mb-3 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-[#3B5BFF]" />
              <span>Payload & Response Inspector</span>
            </h4>

            {selectedLog ? (
              <div className="space-y-3 font-mono text-[11px]">
                <div>
                  <span className="text-[#5B6478] text-[10px] uppercase block">Request URL</span>
                  <div className="p-2 rounded bg-white border border-[#E4E7EF] text-[#0B1020] break-all">
                    {selectedLog.method} {selectedLog.url}
                  </div>
                </div>

                {selectedLog.requestBody && (
                  <div>
                    <span className="text-[#5B6478] text-[10px] uppercase block">Request Body</span>
                    <pre className="p-2 rounded bg-white border border-[#E4E7EF] text-[#0B1020] overflow-x-auto">
                      {JSON.stringify(selectedLog.requestBody, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <span className="text-[#5B6478] text-[10px] uppercase block">Response Body</span>
                  <pre className="p-2 rounded bg-[#0B1020] text-[#93C5FD] overflow-x-auto border border-[#1E293B]">
                    {JSON.stringify(selectedLog.responseBody, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-[#94A3B8]">
                Click an API log entry to inspect headers, request payload, and JSON response.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
