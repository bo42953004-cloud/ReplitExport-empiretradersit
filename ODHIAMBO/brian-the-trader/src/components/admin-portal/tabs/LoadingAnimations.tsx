import React from 'react';
import { useAdminPortal, TLoaderStyle } from '../AdminPortalContext';

type TLoaderOption = {
    id: TLoaderStyle;
    label: string;
    description: string;
    isAdvanced?: boolean;
};

const LOADERS: TLoaderOption[] = [
    { id: 'pulse', label: 'Pulse', description: 'A smooth breathing pulse ring.' },
    { id: 'spin', label: 'Spin', description: 'Classic rotating spinner arc.' },
    { id: 'dots', label: 'Dots', description: 'Three bouncing dots in sequence.' },
    { id: 'bars', label: 'Bars', description: 'Animated vertical audio bars.' },
    { id: 'wave', label: 'Wave', description: 'Flowing wave animation.' },
    { id: 'matrix', label: 'Matrix', description: 'Full-screen matrix digital rain with branding.', isAdvanced: true },
    { id: 'neon', label: 'Neon Glow', description: 'Full-screen neon pulse with progress bar and logo.', isAdvanced: true },
    { id: 'cinematic', label: 'Cinematic', description: 'Full-screen cinematic reveal with particles and percentage.', isAdvanced: true },
];

export const LoaderPreview: React.FC<{ style: TLoaderStyle; size?: 'sm' | 'md' }> = ({ style, size = 'md' }) => {
    const cls = `loader-preview loader-preview--${style} loader-preview--${size}`;
    if (style === 'pulse') {
        return (
            <div className={cls}>
                <div className='lp-pulse__ring' />
                <div className='lp-pulse__dot' />
            </div>
        );
    }
    if (style === 'spin') {
        return (
            <div className={cls}>
                <div className='lp-spin__track' />
                <div className='lp-spin__arc' />
            </div>
        );
    }
    if (style === 'dots') {
        return (
            <div className={cls}>
                <div className='lp-dot' style={{ animationDelay: '0s' }} />
                <div className='lp-dot' style={{ animationDelay: '0.15s' }} />
                <div className='lp-dot' style={{ animationDelay: '0.3s' }} />
            </div>
        );
    }
    if (style === 'bars') {
        return (
            <div className={cls}>
                {[0, 0.1, 0.2, 0.3, 0.4].map((d, i) => (
                    <div key={i} className='lp-bar' style={{ animationDelay: `${d}s` }} />
                ))}
            </div>
        );
    }
    if (style === 'wave') {
        return (
            <div className={cls}>
                {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((d, i) => (
                    <div key={i} className='lp-wave-dot' style={{ animationDelay: `${d}s` }} />
                ))}
            </div>
        );
    }
    if (style === 'matrix') {
        return (
            <div className={cls}>
                <div className='lp-matrix'>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className='lp-matrix__col' style={{ animationDelay: `${i * 0.12}s` }}>
                            {['01', '10', '11', '00', '01'][i]}
                        </span>
                    ))}
                </div>
            </div>
        );
    }
    if (style === 'neon') {
        return (
            <div className={cls}>
                <div className='lp-neon__ring' />
                <div className='lp-neon__inner' />
            </div>
        );
    }
    if (style === 'cinematic') {
        return (
            <div className={cls}>
                <div className='lp-cinematic__bar' />
                <div className='lp-cinematic__line' />
            </div>
        );
    }
    return null;
};

// ─── Full-screen Advanced Loaders ─────────────────────────────────────────────

const MatrixLoader: React.FC<{ message?: string }> = ({ message }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const cols = Math.floor(canvas.width / 20);
        const drops = Array(cols).fill(1);
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*';

        const draw = () => {
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0f0';
            ctx.font = '14px monospace';
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * 20, drops[i] * 20);
                if (drops[i] * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        };
        const interval = setInterval(draw, 33);
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        const timer = setInterval(() => setProgress(p => Math.min(p + 2, 95)), 60);
        return () => clearInterval(timer);
    }, []);

    const siteName = (() => { try { const s = JSON.parse(localStorage.getItem('admin_portal_settings') || '{}'); return s.siteName || 'EMPIRE TRADER'; } catch { return 'EMPIRE TRADER'; } })();

    return (
        <div className='adv-loader adv-loader--matrix'>
            <canvas ref={canvasRef} className='adv-loader__canvas' />
            <div className='adv-loader__content'>
                <div className='adv-loader__brand adv-loader__brand--matrix'>{siteName}</div>
                <div className='adv-loader__message'>{message || 'Initializing...'}</div>
                <div className='adv-loader__progress-track'>
                    <div className='adv-loader__progress-fill adv-loader__progress-fill--matrix' style={{ width: `${progress}%` }} />
                </div>
                <div className='adv-loader__pct'>{progress}%</div>
            </div>
        </div>
    );
};

const NeonLoader: React.FC<{ message?: string }> = ({ message }) => {
    const [progress, setProgress] = React.useState(0);
    const siteName = (() => { try { const s = JSON.parse(localStorage.getItem('admin_portal_settings') || '{}'); return s.siteName || 'EMPIRE TRADER'; } catch { return 'EMPIRE TRADER'; } })();

    React.useEffect(() => {
        const timer = setInterval(() => setProgress(p => Math.min(p + 1.8, 95)), 55);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className='adv-loader adv-loader--neon'>
            <div className='adv-loader__neon-bg' />
            <div className='adv-loader__particles'>
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className='adv-loader__particle' style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${3 + Math.random() * 4}s` }} />
                ))}
            </div>
            <div className='adv-loader__content'>
                <div className='adv-loader__neon-rings'>
                    <div className='adv-loader__neon-ring adv-loader__neon-ring--1' />
                    <div className='adv-loader__neon-ring adv-loader__neon-ring--2' />
                    <div className='adv-loader__neon-ring adv-loader__neon-ring--3' />
                    <div className='adv-loader__neon-core' />
                </div>
                <div className='adv-loader__brand adv-loader__brand--neon'>{siteName}</div>
                <div className='adv-loader__message'>{message || 'Loading platform...'}</div>
                <div className='adv-loader__progress-track adv-loader__progress-track--neon'>
                    <div className='adv-loader__progress-fill adv-loader__progress-fill--neon' style={{ width: `${progress}%` }} />
                    <div className='adv-loader__progress-glow' style={{ left: `${progress}%` }} />
                </div>
                <div className='adv-loader__pct adv-loader__pct--neon'>{Math.round(progress)}%</div>
            </div>
        </div>
    );
};

const CinematicLoader: React.FC<{ message?: string }> = ({ message }) => {
    const [progress, setProgress] = React.useState(0);
    const [phase, setPhase] = React.useState(0);
    const siteName = (() => { try { const s = JSON.parse(localStorage.getItem('admin_portal_settings') || '{}'); return s.siteName || 'EMPIRE TRADER'; } catch { return 'EMPIRE TRADER'; } })();

    React.useEffect(() => {
        const timer = setInterval(() => setProgress(p => { const next = Math.min(p + 1.5, 95); if (next > 30) setPhase(1); if (next > 70) setPhase(2); return next; }), 50);
        return () => clearInterval(timer);
    }, []);

    const phases = ['CONNECTING', 'LOADING DATA', 'READY'];

    return (
        <div className='adv-loader adv-loader--cinematic'>
            <div className='adv-loader__cinematic-grid' />
            <div className='adv-loader__cinematic-scan' />
            <div className='adv-loader__content adv-loader__content--cinematic'>
                <div className='adv-loader__cinematic-top'>
                    <span className='adv-loader__cinematic-tag'>SYS.BOOT</span>
                    <span className='adv-loader__cinematic-tag'>v2.0.1</span>
                </div>
                <div className='adv-loader__brand adv-loader__brand--cinematic'>{siteName}</div>
                <div className='adv-loader__cinematic-phase'>{phases[phase]}</div>
                <div className='adv-loader__progress-track adv-loader__progress-track--cinematic'>
                    <div className='adv-loader__progress-fill adv-loader__progress-fill--cinematic' style={{ width: `${progress}%` }} />
                </div>
                <div className='adv-loader__cinematic-stats'>
                    <span>{Math.round(progress)}%</span>
                    <span>{message || 'Initializing modules...'}</span>
                </div>
                <div className='adv-loader__cinematic-dots'>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className='adv-loader__cinematic-dot' style={{ animationDelay: `${i * 0.3}s` }} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const AdvancedLoader: React.FC<{ style: TLoaderStyle; message?: string }> = ({ style, message }) => {
    if (style === 'matrix') return <MatrixLoader message={message} />;
    if (style === 'neon') return <NeonLoader message={message} />;
    if (style === 'cinematic') return <CinematicLoader message={message} />;
    return null;
};

const LoadingAnimations: React.FC = () => {
    const { settings, updateSettings } = useAdminPortal();

    const basicLoaders = LOADERS.filter(l => !l.isAdvanced);
    const advancedLoaders = LOADERS.filter(l => l.isAdvanced);

    return (
        <div className='admin-tab__loaders'>
            <div className='admin-tab__header'>
                <h2 className='admin-tab__title'>Loading Animations</h2>
                <p className='admin-tab__subtitle'>Choose the site-wide loading animation shown during page loads.</p>
            </div>

            <h3 className='loaders-section-title'>Basic Loaders</h3>
            <div className='loaders-grid'>
                {basicLoaders.map(loader => (
                    <button
                        key={loader.id}
                        className={`loader-option ${settings.loaderStyle === loader.id ? 'loader-option--active' : ''}`}
                        onClick={() => updateSettings({ loaderStyle: loader.id })}
                    >
                        <div className='loader-option__preview'>
                            <LoaderPreview style={loader.id} />
                        </div>
                        <div className='loader-option__info'>
                            <span className='loader-option__name'>{loader.label}</span>
                            <span className='loader-option__desc'>{loader.description}</span>
                        </div>
                        {settings.loaderStyle === loader.id && <span className='loader-option__check'>✓</span>}
                    </button>
                ))}
            </div>

            <h3 className='loaders-section-title loaders-section-title--advanced'>
                ⚡ Advanced Full-Screen Loaders
                <span className='loaders-advanced-badge'>PRO</span>
            </h3>
            <p className='loaders-section-subtitle'>Full-screen professional loading screens with animations, progress bars, and your site branding.</p>
            <div className='loaders-grid loaders-grid--advanced'>
                {advancedLoaders.map(loader => (
                    <button
                        key={loader.id}
                        className={`loader-option loader-option--advanced ${settings.loaderStyle === loader.id ? 'loader-option--active' : ''}`}
                        onClick={() => updateSettings({ loaderStyle: loader.id })}
                    >
                        <div className='loader-option__preview loader-option__preview--advanced'>
                            <LoaderPreview style={loader.id} />
                        </div>
                        <div className='loader-option__info'>
                            <span className='loader-option__name'>{loader.label}</span>
                            <span className='loader-option__desc'>{loader.description}</span>
                        </div>
                        {settings.loaderStyle === loader.id && <span className='loader-option__check'>✓</span>}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LoadingAnimations;
