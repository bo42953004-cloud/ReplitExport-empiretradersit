import React, { createContext, useContext, useEffect, useState } from 'react';

export type TLoaderStyle = 'pulse' | 'spin' | 'dots' | 'bars' | 'wave' | 'matrix' | 'neon' | 'cinematic';

export type TAnalysisTool = {
    id: string;
    name: string;
    description: string;
    url: string;
    icon: string;
};

export type TSocialLink = {
    id: string;
    platform: 'telegram' | 'youtube' | 'tiktok' | 'whatsapp' | 'twitter' | 'instagram' | 'discord' | 'facebook';
    label: string;
    url: string;
};

export type TCustomTab = {
    id: string;
    name: string;
    icon: string;
    url: string;
};

export type TAdminSettings = {
    password: string;
    logoUrl: string;
    siteName: string;
    aboutText: string;
    colorActiveTab: string;
    colorInactiveTab: string;
    colorPrimary: string;
    colorBackground: string;
    loaderStyle: TLoaderStyle;
    analysisTools: TAnalysisTool[];
    socialLinks: TSocialLink[];
    customTabs: TCustomTab[];
    deletedDefaultBots: string[];
    tickerMessage: string;
    tickerEnabled: boolean;
    tickerColor: string;
};

const DEFAULT_ANALYSIS_TOOLS: TAnalysisTool[] = [
    { id: 'tradingview', name: 'TradingView Chart', description: 'Advanced charting with 100+ indicators and drawing tools.', url: 'https://charts.deriv.com', icon: '📊' },
    { id: 'volatility-calculator', name: 'Volatility Calculator', description: 'Calculate historical volatility and implied volatility metrics.', url: 'https://deriv.com/trading-tools/', icon: '📐' },
    { id: 'economic-calendar', name: 'Economic Calendar', description: 'Track market-moving economic events and announcements.', url: 'https://deriv.com/economic-calendar/', icon: '📅' },
    { id: 'pip-calculator', name: 'Pip & Profit Calculator', description: 'Calculate pip value and potential profit/loss before trading.', url: 'https://deriv.com/trading-tools/', icon: '🧮' },
];

const DEFAULT_SETTINGS: TAdminSettings = {
    password: 'admin123',
    logoUrl: '',
    siteName: 'Trading Bot',
    aboutText: 'A powerful automated trading platform built on the Deriv ecosystem.',
    colorActiveTab: '#21cde4',
    colorInactiveTab: '#334155',
    colorPrimary: '#21cde4',
    colorBackground: '#0f172a',
    loaderStyle: 'pulse',
    analysisTools: DEFAULT_ANALYSIS_TOOLS,
    socialLinks: [],
    customTabs: [],
    deletedDefaultBots: [],
    tickerMessage: '',
    tickerEnabled: false,
    tickerColor: '#21cde4',
};

export const STORAGE_KEY = 'admin_portal_settings';

function loadSettings(): TAdminSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return { ...DEFAULT_SETTINGS, ...parsed };
        }
    } catch { /* ignore */ }
    return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: TAdminSettings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch { /* ignore */ }
}

type TAdminPortalContext = {
    settings: TAdminSettings;
    updateSettings: (patch: Partial<TAdminSettings>) => void;
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    isAuthenticated: boolean;
    setIsAuthenticated: (v: boolean) => void;
};

const AdminPortalContext = createContext<TAdminPortalContext | null>(null);
export { AdminPortalContext };

export const AdminPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<TAdminSettings>(loadSettings);
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // On mount: pull settings from the API server so every device/browser gets
    // the same configuration the admin last saved.
    useEffect(() => {
        fetch('/api/settings')
            .then(r => r.ok ? r.json() : null)
            .then((data: Partial<TAdminSettings> | null) => {
                if (data && typeof data === 'object') {
                    const merged = { ...DEFAULT_SETTINGS, ...data };
                    setSettings(merged);
                    saveSettings(merged);
                    applyColors(merged);
                }
            })
            .catch(() => { /* Server unavailable — localStorage settings remain active */ });
    }, []);

    const updateSettings = (patch: Partial<TAdminSettings>) => {
        setSettings(prev => {
            const next = { ...prev, ...patch };
            saveSettings(next);
            // Push to server so ALL devices pick up the change on next load
            fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(next),
            }).catch(() => { /* Server unavailable — change saved to localStorage only */ });
            return next;
        });
    };

    useEffect(() => {
        applyColors(settings);
    }, [settings.colorActiveTab, settings.colorInactiveTab, settings.colorPrimary, settings.colorBackground]);

    return (
        <AdminPortalContext.Provider value={{ settings, updateSettings, isOpen, setIsOpen, isAuthenticated, setIsAuthenticated }}>
            {children}
        </AdminPortalContext.Provider>
    );
};

export function useAdminPortal() {
    const ctx = useContext(AdminPortalContext);
    if (!ctx) throw new Error('useAdminPortal must be used inside AdminPortalProvider');
    return ctx;
}

export function applyColors(settings: Pick<TAdminSettings, 'colorActiveTab' | 'colorInactiveTab' | 'colorPrimary' | 'colorBackground'>) {
    const root = document.documentElement;
    root.style.setProperty('--admin-color-active-tab', settings.colorActiveTab);
    root.style.setProperty('--admin-color-inactive-tab', settings.colorInactiveTab);
    root.style.setProperty('--admin-color-primary', settings.colorPrimary);
    root.style.setProperty('--admin-color-background', settings.colorBackground);
    root.style.setProperty('--color-brand-secondary-color', settings.colorPrimary);
    root.style.setProperty('--brand-red-coral', settings.colorPrimary);
    root.style.setProperty('--admin-color-active-tab-bg', hexToRgba(settings.colorActiveTab, 0.13));
    window.dispatchEvent(new Event('admin_settings_updated'));
}

function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16) || 33;
    const g = parseInt(hex.slice(3, 5), 16) || 205;
    const b = parseInt(hex.slice(5, 7), 16) || 228;
    return `rgba(${r},${g},${b},${alpha})`;
}

export function getLoaderStyle(): TLoaderStyle {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) { const parsed = JSON.parse(raw); return parsed.loaderStyle || 'pulse'; }
    } catch { /* ignore */ }
    return 'pulse';
}

export function getSocialLinks(): TSocialLink[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) { const parsed = JSON.parse(raw); return parsed.socialLinks || []; }
    } catch { /* ignore */ }
    return [];
}

export function getCustomTabs(): TCustomTab[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) { const parsed = JSON.parse(raw); return parsed.customTabs || []; }
    } catch { /* ignore */ }
    return [];
}
