export interface ApiLogEntry {
  id: string;
  method: string;
  url: string;
  status: number;
  durationMs: number;
  timestamp: string;
  isMockFallback?: boolean;
  requestBody?: any;
  responseBody?: any;
}

type LogListener = (entry: ApiLogEntry) => void;

class ApiClient {
  private logListeners: Set<LogListener> = new Set();
  private logs: ApiLogEntry[] = [];

  getAccessToken(): string | null {
    return localStorage.getItem('rt_access_token');
  }

  setTokens(access: string, refresh?: string) {
    localStorage.setItem('rt_access_token', access);
    if (refresh) localStorage.setItem('rt_refresh_token', refresh);
  }

  clearTokens() {
    localStorage.removeItem('rt_access_token');
    localStorage.removeItem('rt_refresh_token');
  }

  getLogs(): ApiLogEntry[] {
    return [...this.logs];
  }

  subscribeLogs(listener: LogListener): () => void {
    this.logListeners.add(listener);
    return () => this.logListeners.delete(listener);
  }

  private notifyLog(entry: ApiLogEntry) {
    this.logs.unshift(entry);
    if (this.logs.length > 100) this.logs.pop();
    this.logListeners.forEach(listener => listener(entry));
  }

  async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<{ status: number; data: T; ok: boolean; error?: any }> {
    const startTime = performance.now();
    const token = this.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let parsedResponse: any = null;
    let statusCode = 0;
    let ok = false;

    try {
      const res = await fetch(path, {
        ...options,
        headers,
      });

      statusCode = res.status;
      ok = res.ok;

      try {
        parsedResponse = await res.json();
      } catch {
        parsedResponse = null;
      }

      const durationMs = Math.round(performance.now() - startTime);

      this.notifyLog({
        id: Math.random().toString(36).substring(2, 9),
        method: options.method || 'GET',
        url: path,
        status: statusCode,
        durationMs,
        timestamp: new Date().toLocaleTimeString(),
        requestBody: options.body ? JSON.parse(options.body as string) : undefined,
        responseBody: parsedResponse,
      });

      return { status: statusCode, data: parsedResponse, ok, error: !ok ? parsedResponse?.error : undefined };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      this.notifyLog({
        id: Math.random().toString(36).substring(2, 9),
        method: options.method || 'GET',
        url: path,
        status: 0,
        durationMs,
        timestamp: new Date().toLocaleTimeString(),
        responseBody: { error: err.message },
      });
      return { status: 0, data: null as any, ok: false, error: { message: err.message } };
    }
  }

  // Auth methods
  async signup(email: string, password: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async verifyEmail(token: string) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerification(email: string) {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async login(email: string, password: string) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.ok && res.data?.access_token) {
      this.setTokens(res.data.access_token, res.data.refresh_token);
    }
    return res;
  }

  async logout() {
    const res = await this.request('/auth/logout', { method: 'POST' });
    this.clearTokens();
    return res;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, new_password: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password }),
    });
  }

  async changePassword(current_password: string, new_password: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    });
  }

  async deleteAccount() {
    const res = await this.request('/auth/account', { method: 'DELETE' });
    this.clearTokens();
    return res;
  }

  // Repos CRUD
  async createRepo(url: string) {
    return this.request('/repos', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  async listRepos() {
    return this.request<{ repos: any[] }>('/repos');
  }

  async getRepo(id: number | string) {
    return this.request(`/repos/${id}`);
  }

  async deleteRepo(id: number | string) {
    return this.request(`/repos/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
