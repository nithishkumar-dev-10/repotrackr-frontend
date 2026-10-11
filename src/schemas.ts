export const GITHUB_HOST = 'github.com';
const OWNER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const NAME_RE = /^[A-Za-z0-9._-]+$/;

export function parseGithubUrl(value: string): { owner: string; name: string; url: string } {
  const raw = (value || '').trim();
  if (!raw) {
    throw new Error('Repo URL must not be empty');
  }

  const candidate = raw.includes('://') ? raw : `https://${raw}`;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error('Only public GitHub URLs (github.com/owner/name) are supported');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Repo URL must use http or https');
  }

  let host = (parsed.hostname || '').toLowerCase();
  if (host.startsWith('www.')) {
    host = host.slice(4);
  }
  if (host !== GITHUB_HOST) {
    throw new Error('Only public GitHub URLs (github.com/owner/name) are supported');
  }

  const parts = parsed.pathname.split('/').filter(Boolean);
  if (parts.length !== 2) {
    throw new Error('GitHub URL must be in the form github.com/owner/name');
  }

  let [owner, name] = parts;
  if (name.endsWith('.git')) {
    name = name.slice(0, -4);
  }

  if (!OWNER_RE.test(owner)) {
    throw new Error('Invalid GitHub owner name');
  }
  if (!NAME_RE.test(name)) {
    throw new Error('Invalid GitHub repository name');
  }

  const lowerOwner = owner.toLowerCase();
  const lowerName = name.toLowerCase();

  return {
    owner: lowerOwner,
    name: lowerName,
    url: `https://${GITHUB_HOST}/${lowerOwner}/${lowerName}`,
  };
}

export function errorPayload(code: string, message: string, details?: any) {
  return {
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
}
