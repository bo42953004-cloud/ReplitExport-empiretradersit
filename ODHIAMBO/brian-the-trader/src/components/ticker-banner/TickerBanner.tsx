import React, { useEffect, useState } from 'react';
import { useAdminPortal } from '@/components/admin-portal/AdminPortalContext';
import './ticker-banner.scss';

const DISMISSED_KEY = 'empire_ticker_dismissed_v';

const TickerBanner: React.FC = () => {
    const { settings } = useAdminPortal();
    const msg = settings.tickerMessage?.trim() ?? '';
    const msgHash = msg.slice(0, 30);
    const storageKey = DISMISSED_KEY + msgHash;

    const [dismissed, setDismissed] = useState(() => {
        try { return sessionStorage.getItem(storageKey) === '1'; } catch { return false; }
    });

    useEffect(() => {
        setDismissed(() => {
            try { return sessionStorage.getItem(storageKey) === '1'; } catch { return false; }
        });
    }, [storageKey]);

    if (dismissed || !settings.tickerEnabled || !msg) return null;

    const handleDismiss = () => {
        try { sessionStorage.setItem(storageKey, '1'); } catch {}
        setDismissed(true);
    };

    const accentColor = settings.tickerColor || '#21cde4';

    const repeatedMsg = Array.from({ length: 6 }, (_, i) => (
        <span key={i} className='ticker-banner__segment'>
            <span className='ticker-banner__diamond' style={{ color: accentColor }}>◆</span>
            {msg}
        </span>
    ));

    return (
        <div className='ticker-banner' style={{ '--ticker-accent': accentColor } as React.CSSProperties}>
            <div className='ticker-banner__badge'>
                <span className='ticker-banner__pulse' />
                LIVE
            </div>
            <div className='ticker-banner__viewport'>
                <div className='ticker-banner__track'>
                    {repeatedMsg}
                    {repeatedMsg}
                </div>
            </div>
            <button className='ticker-banner__dismiss' onClick={handleDismiss} aria-label='Dismiss'>
                <svg width='10' height='10' viewBox='0 0 10 10' fill='none'>
                    <path d='M1 1l8 8M9 1l-8 8' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' />
                </svg>
            </button>
        </div>
    );
};

export default TickerBanner;
