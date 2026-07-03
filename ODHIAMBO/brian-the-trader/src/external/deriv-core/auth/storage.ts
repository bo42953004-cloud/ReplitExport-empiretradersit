import type { AuthInfo, DerivAccount, StoredCSRFToken, StoredCodeVerifier } from '../types';

const CSRF_TOKEN_KEY = 'oauth_csrf_token';
const CODE_VERIFIER_KEY = 'oauth_code_verifier';
const AUTH_INFO_KEY = 'auth_info';
const DERIV_ACCOUNTS_KEY = 'deriv_accounts';
const ACTIVE_LOGINID_KEY = 'active_loginid';
const ACCOUNT_TYPE_KEY = 'account_type';

const TOKEN_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes — must survive browser redirect round-trip

// --- CSRF Token ---
// Uses localStorage (not sessionStorage) so the token survives cross-origin
// redirects back from the Deriv OAuth page (Safari/mobile clear sessionStorage
// on external navigation).

export function storeCSRFToken(token: string): void {
  const stored: StoredCSRFToken = { value: token, createdAt: Date.now() };
  localStorage.setItem(CSRF_TOKEN_KEY, JSON.stringify(stored));
}

export function getCSRFToken(): string | null {
  const raw = localStorage.getItem(CSRF_TOKEN_KEY);
  if (!raw) return null;

  const stored: StoredCSRFToken = JSON.parse(raw);
  if (Date.now() - stored.createdAt > TOKEN_MAX_AGE_MS) {
    clearCSRFToken();
    return null;
  }
  return stored.value;
}

export function clearCSRFToken(): void {
  localStorage.removeItem(CSRF_TOKEN_KEY);
}

// --- PKCE Code Verifier ---
// Also uses localStorage for the same cross-origin redirect reason.

export function storeCodeVerifier(verifier: string): void {
  const stored: StoredCodeVerifier = { value: verifier, createdAt: Date.now() };
  localStorage.setItem(CODE_VERIFIER_KEY, JSON.stringify(stored));
}

export function getCodeVerifier(): string | null {
  const raw = localStorage.getItem(CODE_VERIFIER_KEY);
  if (!raw) return null;

  const stored: StoredCodeVerifier = JSON.parse(raw);
  if (Date.now() - stored.createdAt > TOKEN_MAX_AGE_MS) {
    clearCodeVerifier();
    return null;
  }
  return stored.value;
}

export function clearCodeVerifier(): void {
  localStorage.removeItem(CODE_VERIFIER_KEY);
}

// --- Auth Info ---

export function storeAuthInfo(authInfo: AuthInfo): void {
  localStorage.setItem(AUTH_INFO_KEY, JSON.stringify(authInfo));
}

export function getAuthInfo(): AuthInfo | null {
  const raw = localStorage.getItem(AUTH_INFO_KEY);
  if (!raw) return null;

  const authInfo: AuthInfo = JSON.parse(raw);
  if (authInfo.expires_at && Date.now() > authInfo.expires_at * 1000) {
    return null; // Token expired
  }
  return authInfo;
}

export function clearAuthInfo(): void {
  localStorage.removeItem(AUTH_INFO_KEY);
}

// --- Deriv Accounts ---

export function storeDerivAccounts(accounts: DerivAccount[]): void {
  localStorage.setItem(DERIV_ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getDerivAccounts(): DerivAccount[] | null {
  const raw = localStorage.getItem(DERIV_ACCOUNTS_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

export function clearDerivAccounts(): void {
  localStorage.removeItem(DERIV_ACCOUNTS_KEY);
}

// --- Active Login ID (localStorage) ---

export function setActiveLoginId(loginId: string): void {
  localStorage.setItem(ACTIVE_LOGINID_KEY, loginId);
}

export function getActiveLoginId(): string | null {
  return localStorage.getItem(ACTIVE_LOGINID_KEY);
}

// --- Account Type (localStorage) ---

export function setAccountType(type: 'demo' | 'real'): void {
  localStorage.setItem(ACCOUNT_TYPE_KEY, type);
}

export function getAccountType(): string | null {
  return localStorage.getItem(ACCOUNT_TYPE_KEY);
}

// --- Clear All Auth Data ---

export function clearAllAuthData(): void {
  clearCSRFToken();
  clearCodeVerifier();
  clearAuthInfo();
  clearDerivAccounts();
  localStorage.removeItem(ACTIVE_LOGINID_KEY);
  localStorage.removeItem(ACCOUNT_TYPE_KEY);
  // Also clear sessionStorage keys written by DerivWSAccountsService
  sessionStorage.removeItem(DERIV_ACCOUNTS_KEY);
}
