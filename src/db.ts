export type EmailTokenType = 'verify' | 'reset';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  is_verified: boolean;
  created_at: string;
}

export interface EmailToken {
  id: number;
  user_id: number;
  type: EmailTokenType;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
}

export interface Repo {
  id: number;
  user_id: number;
  url: string;
  owner: string;
  name: string;
  status: string;
  created_at: string;
}

class InMemoryDb {
  private users: Map<number, User> = new Map();
  private emailTokens: Map<number, EmailToken> = new Map();
  private repos: Map<number, Repo> = new Map();

  private nextUserId: number = 1;
  private nextTokenId: number = 1;
  private nextRepoId: number = 1;

  // User operations
  createUser(email: string, passwordHash: string): User {
    const user: User = {
      id: this.nextUserId++,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      is_verified: false,
      created_at: new Date().toISOString(),
    };
    this.users.set(user.id, user);
    return user;
  }

  findUserById(id: number): User | null {
    return this.users.get(id) || null;
  }

  findUserByEmail(email: string): User | null {
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email === normalized) {
        return user;
      }
    }
    return null;
  }

  updateUser(id: number, updates: Partial<User>): User | null {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  deleteUser(id: number): boolean {
    if (!this.users.has(id)) return false;
    this.users.delete(id);
    // Cascade delete tokens
    for (const [tokenId, token] of this.emailTokens.entries()) {
      if (token.user_id === id) {
        this.emailTokens.delete(tokenId);
      }
    }
    // Cascade delete repos
    for (const [repoId, repo] of this.repos.entries()) {
      if (repo.user_id === id) {
        this.repos.delete(repoId);
      }
    }
    return true;
  }

  // Token operations
  createToken(userId: number, type: EmailTokenType, tokenHash: string, expiresAt: Date): EmailToken {
    const token: EmailToken = {
      id: this.nextTokenId++,
      user_id: userId,
      type,
      token_hash: tokenHash,
      expires_at: expiresAt,
      used_at: null,
    };
    this.emailTokens.set(token.id, token);
    return token;
  }

  findTokenByHashAndType(tokenHash: string, type: EmailTokenType): EmailToken | null {
    for (const token of this.emailTokens.values()) {
      if (token.token_hash === tokenHash && token.type === type) {
        return token;
      }
    }
    return null;
  }

  invalidateActiveTokens(userId: number, type: EmailTokenType): void {
    const now = new Date();
    for (const token of this.emailTokens.values()) {
      if (token.user_id === userId && token.type === type && !token.used_at) {
        token.used_at = now;
      }
    }
  }

  markTokenUsed(tokenId: number): void {
    const token = this.emailTokens.get(tokenId);
    if (token) {
      token.used_at = new Date();
    }
  }

  // Repo operations
  createRepo(userId: number, url: string, owner: string, name: string): Repo {
    const repo: Repo = {
      id: this.nextRepoId++,
      user_id: userId,
      url: url.toLowerCase(),
      owner: owner.toLowerCase(),
      name: name.toLowerCase(),
      status: 'added',
      created_at: new Date().toISOString(),
    };
    this.repos.set(repo.id, repo);
    return repo;
  }

  findRepoByUserAndUrl(userId: number, url: string): Repo | null {
    const normalized = url.toLowerCase();
    for (const repo of this.repos.values()) {
      if (repo.user_id === userId && repo.url === normalized) {
        return repo;
      }
    }
    return null;
  }

  findRepoById(id: number): Repo | null {
    return this.repos.get(id) || null;
  }

  listReposByUserId(userId: number): Repo[] {
    const list: Repo[] = [];
    for (const repo of this.repos.values()) {
      if (repo.user_id === userId) {
        list.push(repo);
      }
    }
    // Newest first
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime() || b.id - a.id);
  }

  deleteRepo(id: number): boolean {
    return this.repos.delete(id);
  }
}

export const db = new InMemoryDb();
