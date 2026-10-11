import React, { useState } from 'react';
import { FolderGit2, X, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';

interface TrackRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRepoAdded: () => void;
}

export const TrackRepoModal: React.FC<TrackRepoModalProps> = ({ isOpen, onClose, onRepoAdded }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a GitHub repository link.');
      return;
    }

    if (!trimmed.toLowerCase().includes('github.com')) {
      setError('Only public GitHub repositories (e.g. github.com/owner/repo) are supported.');
      return;
    }

    setLoading(true);
    const res = await api.createRepo(trimmed);
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setUrl('');
        onRepoAdded();
        onClose();
      }, 900);
    } else {
      setError(res.error?.message || 'Failed to add repository. Please verify URL.');
    }
  };

  const sampleRepos = [
    'https://github.com/pallets/flask',
    'https://github.com/tiangolo/fastapi',
    'https://github.com/psf/requests',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E4E7EF] p-6 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EF]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8ECFF] text-[#3B5BFF] flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0B1020]">Track Python Repository</h3>
              <p className="text-xs text-[#5B6478]">Ingest, build graph, and reason over codebase evidence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#5B6478] hover:bg-[#F6F7FB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#EF4444] text-xs flex items-center gap-2 animate-in shake duration-150">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0B1020] mb-1.5">
              GitHub Repository URL
            </label>
            <input
              type="text"
              required
              autoFocus
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E7EF] bg-[#F6F7FB] focus:bg-white focus:border-[#3B5BFF] focus:outline-none text-sm transition-all"
            />
          </div>

          <div>
            <span className="text-[11px] font-medium text-[#5B6478]">Try quick example:</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {sampleRepos.map((s, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setUrl(s)}
                  className="px-2.5 py-1 rounded-md bg-[#F6F7FB] hover:bg-[#E8ECFF] text-[#3B5BFF] text-[11px] font-mono border border-[#E4E7EF] hover:border-[#3B5BFF]/30 transition-all cursor-pointer"
                >
                  {s.replace('https://github.com/', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5B6478] hover:bg-[#F6F7FB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B1020] hover:bg-[#1E293B] shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Added!</span>
                </>
              ) : (
                <span>Track Repository</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
