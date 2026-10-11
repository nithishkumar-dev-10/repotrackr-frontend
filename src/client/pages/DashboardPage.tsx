import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  RefreshCw,
  FolderGit2,
  ExternalLink,
  Trash2,
  Sparkles,
  Database,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../context/AuthContext';
import { TrackRepoModal } from '../components/TrackRepoModal';
import { SvgMiniGraphThumbnail } from '../components/2d/SvgMiniGraphThumbnail';

interface Repo {
  id: number;
  url: string;
  owner: string;
  name: string;
  status: string;
  created_at: string;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [indexingId, setIndexingId] = useState<number | null>(null);

  const fetchRepos = async () => {
    const res = await api.listRepos();
    if (res.ok && res.data?.repos) {
      setRepos(res.data.repos);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRepos();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to untrack ${name}?`)) return;
    await api.deleteRepo(id);
    fetchRepos();
  };

  const handleStartIndex = async (id: number) => {
    setIndexingId(id);
    // Call real POST /repos/:id/index endpoint
    await api.request(`/repos/${id}/index`, { method: 'POST' });
    setTimeout(() => {
      setIndexingId(null);
      fetchRepos();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1020]">
              Welcome back, {user?.email.split('@')[0]}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#E8ECFF] text-[#3B5BFF] text-xs font-bold">
              WORKSPACE
            </span>
          </div>
          <p className="text-sm text-[#5B6478] mt-1">
            Monitor and explore your ingested Python repositories in 3D.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-[#E4E7EF] bg-white text-[#5B6478] hover:text-[#0B1020] hover:bg-[#F6F7FB] transition-all cursor-pointer shadow-xs"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B1020] hover:bg-[#1E293B] shadow-md transition-all flex items-center gap-2 cursor-pointer group"
          >
            <Plus className="w-4 h-4 text-[#38BDF8] group-hover:rotate-90 transition-transform" />
            <span>Track Repository</span>
          </button>
        </div>
      </div>

      {/* Repository Cards Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-64 rounded-2xl bg-white border border-[#E4E7EF] animate-pulse p-5" />
          ))}
        </div>
      ) : repos.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-[#E4E7EF] shadow-sm text-center max-w-lg mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-[#E8ECFF] text-[#3B5BFF] flex items-center justify-center mx-auto mb-4">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0B1020]">No repositories tracked yet</h3>
          <p className="text-xs text-[#5B6478] mt-1.5 leading-relaxed">
            Add your first public Python GitHub repository to generate its 3D galaxy and start reasoning.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-6 px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#3B5BFF] hover:bg-[#2563EB] shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Track your first repo</span>
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo, idx) => {
            const isIndexing = indexingId === repo.id;
            return (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl bg-white border border-[#E4E7EF] shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* 2D Animated Mini Graph Thumbnail */}
                  <div className="p-3 bg-[#F6F7FB]">
                    <SvgMiniGraphThumbnail status={repo.status} />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[#5B6478]">
                        <GitBranch className="w-3.5 h-3.5 text-[#3B5BFF]" />
                        <span>{repo.owner}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8ECFF] text-[#3B5BFF]">
                        {repo.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#0B1020] group-hover:text-[#3B5BFF] transition-colors truncate">
                      {repo.name}
                    </h3>

                    <p className="text-xs text-[#5B6478] font-mono mt-1 truncate">
                      {repo.url}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-[#E4E7EF] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStartIndex(repo.id)}
                      disabled={isIndexing}
                      className="px-2.5 py-1.5 rounded-lg border border-[#E4E7EF] hover:border-[#3B5BFF]/30 hover:bg-[#F6F7FB] text-[11px] font-semibold text-[#5B6478] hover:text-[#0B1020] transition-all flex items-center gap-1 cursor-pointer"
                      title="Run deterministic index"
                    >
                      <Database className="w-3 h-3 text-[#3B5BFF]" />
                      <span>{isIndexing ? 'Indexing...' : 'Index'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(repo.id, repo.name)}
                      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                      title="Delete repo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Link
                    to={`/repo/${repo.id}`}
                    className="px-4 py-1.5 rounded-lg bg-[#0B1020] hover:bg-[#1E293B] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Galaxy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <TrackRepoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onRepoAdded={fetchRepos}
      />
    </div>
  );
};
