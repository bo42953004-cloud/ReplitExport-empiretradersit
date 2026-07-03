import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { TAnalysisTool } from '@/components/admin-portal/AdminPortalContext';
import './analysis-tools.scss';

const SETTINGS_KEY = 'admin_portal_settings';

function getTools(): TAnalysisTool[] {
    const defaults: TAnalysisTool[] = [
        { id: 'tradingview', name: 'TradingView Chart', description: 'Advanced charting with 100+ indicators.', url: 'https://charts.deriv.com', icon: '📊' },
        { id: 'econ-calendar', name: 'Economic Calendar', description: 'Market-moving events and announcements.', url: 'https://deriv.com/economic-calendar/', icon: '📅' },
        { id: 'volatility-chart', name: 'Deriv Charts', description: 'Official Deriv embedded charts.', url: 'https://charts.deriv.com', icon: '📈' },
        { id: 'pip-calc', name: 'Trading Tools', description: 'Market data, news, and analysis.', url: 'https://deriv.com/trading-tools/', icon: '🧮' },
    ];
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.analysisTools?.length) return parsed.analysisTools;
        }
    } catch { /* ignore */ }
    return defaults;
}

const AnalysisTools = observer(() => {
    const [tools, setTools] = useState<TAnalysisTool[]>([]);
    const [activeTool, setActiveTool] = useState<TAnalysisTool | null>(null);
    const [iframeLoading, setIframeLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const refresh = () => {
            const t = getTools();
            setTools(t);
            if (t.length > 0) setActiveTool(prev => prev ? (t.find(x => x.id === prev.id) ?? t[0]) : t[0]);
        };
        refresh();
        window.addEventListener('admin_settings_updated', refresh);
        return () => window.removeEventListener('admin_settings_updated', refresh);
    }, []);

    const handleSelectTool = (tool: TAnalysisTool) => {
        if (tool.id === activeTool?.id) return;
        setIframeLoading(true);
        setActiveTool(tool);
    };

    return (
        <div className='analysis-page'>
            {/* Collapsible sidebar */}
            <div className={`analysis-page__sidebar ${sidebarOpen ? '' : 'analysis-page__sidebar--collapsed'}`}>
                <button
                    className='analysis-page__sidebar-toggle'
                    onClick={() => setSidebarOpen(v => !v)}
                    title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    {sidebarOpen ? '◀' : '▶'}
                </button>

                {sidebarOpen && (
                    <>
                        <div className='analysis-page__sidebar-header'>
                            <h2 className='analysis-page__sidebar-title'>📊 Tools</h2>
                        </div>
                        <div className='analysis-page__tool-list'>
                            {tools.map(tool => (
                                <button
                                    key={tool.id}
                                    className={`analysis-tool-btn ${activeTool?.id === tool.id ? 'analysis-tool-btn--active' : ''}`}
                                    onClick={() => handleSelectTool(tool)}
                                    title={tool.name}
                                >
                                    <span className='analysis-tool-btn__icon'>{tool.icon}</span>
                                    <div className='analysis-tool-btn__info'>
                                        <span className='analysis-tool-btn__name'>{tool.name}</span>
                                        <span className='analysis-tool-btn__desc'>{tool.description}</span>
                                    </div>
                                    {activeTool?.id === tool.id && <span className='analysis-tool-btn__active-dot' />}
                                </button>
                            ))}
                        </div>
                        {tools.length === 0 && (
                            <div className='analysis-page__empty'>
                                <p>No tools configured.</p>
                                <p className='analysis-page__empty-hint'>Admin can add tools via Ctrl+Shift+A.</p>
                            </div>
                        )}
                    </>
                )}

                {!sidebarOpen && (
                    <div className='analysis-page__sidebar-icons'>
                        {tools.map(tool => (
                            <button
                                key={tool.id}
                                className={`analysis-sidebar-icon ${activeTool?.id === tool.id ? 'analysis-sidebar-icon--active' : ''}`}
                                onClick={() => { handleSelectTool(tool); setSidebarOpen(true); }}
                                title={tool.name}
                            >
                                {tool.icon}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Main iframe area */}
            <div className='analysis-page__frame-area'>
                {activeTool ? (
                    <>
                        <div className='analysis-page__frame-header'>
                            <button
                                className='analysis-page__sidebar-toggle-inline'
                                onClick={() => setSidebarOpen(v => !v)}
                                title={sidebarOpen ? 'Hide tools panel' : 'Show tools panel'}
                            >
                                {sidebarOpen ? '⬅' : '☰'}
                            </button>
                            <span className='analysis-page__frame-icon'>{activeTool.icon}</span>
                            <span className='analysis-page__frame-name'>{activeTool.name}</span>
                            <span className='analysis-page__frame-desc'>{activeTool.description}</span>
                        </div>
                        <div className='analysis-page__frame-wrapper'>
                            {iframeLoading && (
                                <div className='analysis-page__frame-loader'>
                                    <div className='analysis-page__frame-spinner' />
                                    <span>Loading {activeTool.name}…</span>
                                </div>
                            )}
                            <iframe
                                key={activeTool.url}
                                ref={iframeRef}
                                src={activeTool.url}
                                title={activeTool.name}
                                className='analysis-page__iframe'
                                onLoad={() => setIframeLoading(false)}
                                allow='fullscreen'
                                sandbox='allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox'
                            />
                        </div>
                    </>
                ) : (
                    <div className='analysis-page__placeholder'>
                        <span>📊</span>
                        <p>Select an analysis tool from the left to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
});

export default AnalysisTools;
