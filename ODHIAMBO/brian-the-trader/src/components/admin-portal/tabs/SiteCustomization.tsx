import React, { useRef, useState } from 'react';
import { useAdminPortal, applyColors } from '../AdminPortalContext';

const SiteCustomization: React.FC = () => {
    const { settings, updateSettings } = useAdminPortal();
    const fileRef = useRef<HTMLInputElement>(null);
    const [saved, setSaved] = useState(false);
    const [local, setLocal] = useState({
        colorActiveTab: settings.colorActiveTab,
        colorInactiveTab: settings.colorInactiveTab,
        colorPrimary: settings.colorPrimary,
        colorBackground: settings.colorBackground,
        siteName: settings.siteName,
        aboutText: settings.aboutText,
    });
    const [ticker, setTicker] = useState({
        tickerMessage: settings.tickerMessage ?? '',
        tickerEnabled: settings.tickerEnabled ?? false,
        tickerColor: settings.tickerColor ?? '#21cde4',
    });
    const [tickerSaved, setTickerSaved] = useState(false);

    const handleTickerSave = () => {
        updateSettings(ticker);
        setTickerSaved(true);
        setTimeout(() => setTickerSaved(false), 2000);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            const url = ev.target?.result as string;
            updateSettings({ logoUrl: url });
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        updateSettings(local);
        applyColors(local);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const clearLogo = () => updateSettings({ logoUrl: '' });

    const handlePasswordChange = () => {
        const current = prompt('Enter current password:');
        if (current !== settings.password) { alert('Wrong password.'); return; }
        const next = prompt('Enter new password (min 6 chars):');
        if (!next || next.length < 6) { alert('Password too short.'); return; }
        const confirm = prompt('Confirm new password:');
        if (next !== confirm) { alert('Passwords do not match.'); return; }
        updateSettings({ password: next });
        alert('Password updated!');
    };

    return (
        <div className='admin-tab__customize'>
            <div className='admin-tab__header'>
                <h2 className='admin-tab__title'>Site Customization</h2>
                <p className='admin-tab__subtitle'>Control branding, colors, and site identity.</p>
            </div>

            <div className='customize-sections'>
                <section className='customize-section'>
                    <h3 className='customize-section__title'>🖼️ Logo & Branding</h3>
                    <div className='logo-upload'>
                        {settings.logoUrl ? (
                            <div className='logo-preview'>
                                <img src={settings.logoUrl} alt='Site logo' />
                                <button className='admin-btn admin-btn--danger' onClick={clearLogo}>Remove Logo</button>
                            </div>
                        ) : (
                            <div className='logo-placeholder' onClick={() => fileRef.current?.click()}>
                                <span>📷</span>
                                <p>Click to upload logo</p>
                            </div>
                        )}
                        <input ref={fileRef} type='file' accept='image/*' onChange={handleLogoUpload} style={{ display: 'none' }} />
                        <button className='admin-btn admin-btn--secondary' onClick={() => fileRef.current?.click()}>
                            {settings.logoUrl ? 'Change Logo' : 'Upload Logo'}
                        </button>
                    </div>
                    <div className='admin-form__row'>
                        <label>Site Name</label>
                        <input
                            value={local.siteName}
                            onChange={e => setLocal(p => ({ ...p, siteName: e.target.value }))}
                            placeholder='My Trading Bot'
                        />
                    </div>
                    <div className='admin-form__row'>
                        <label>About / Description</label>
                        <textarea
                            value={local.aboutText}
                            onChange={e => setLocal(p => ({ ...p, aboutText: e.target.value }))}
                            placeholder='Describe your platform...'
                            rows={4}
                        />
                    </div>
                </section>

                <section className='customize-section'>
                    <h3 className='customize-section__title'>🎨 Color Scheme</h3>
                    <div className='color-grid'>
                        {[
                            { key: 'colorActiveTab' as const, label: 'Active Tab Color' },
                            { key: 'colorInactiveTab' as const, label: 'Inactive Tab Color' },
                            { key: 'colorPrimary' as const, label: 'Primary / Accent Color' },
                            { key: 'colorBackground' as const, label: 'Background Color' },
                        ].map(({ key, label }) => (
                            <div key={key} className='color-row'>
                                <label>{label}</label>
                                <div className='color-row__input'>
                                    <input
                                        type='color'
                                        value={local[key]}
                                        onChange={e => setLocal(p => ({ ...p, [key]: e.target.value }))}
                                    />
                                    <input
                                        type='text'
                                        value={local[key]}
                                        onChange={e => setLocal(p => ({ ...p, [key]: e.target.value }))}
                                        maxLength={9}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='color-preview'>
                        <div className='color-swatch' style={{ background: local.colorBackground }}>
                            <span className='color-swatch__tab' style={{ background: local.colorActiveTab }}>Active</span>
                            <span className='color-swatch__tab' style={{ background: local.colorInactiveTab, opacity: 0.7 }}>Inactive</span>
                            <span className='color-swatch__accent' style={{ color: local.colorPrimary }}>● Accent</span>
                        </div>
                    </div>
                </section>

                <section className='customize-section'>
                    <h3 className='customize-section__title'>🔐 Security</h3>
                    <button className='admin-btn admin-btn--secondary' onClick={handlePasswordChange}>
                        Change Admin Password
                    </button>
                </section>

                <section className='customize-section'>
                    <h3 className='customize-section__title'>📢 Announcement Ticker</h3>
                    <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.6rem' }}>
                        A scrolling banner shown at the top of the page for all traders.
                        Hover over the banner to pause it. Traders can dismiss it per session.
                    </p>
                    <div className='admin-form__row' style={{ flexDirection: 'row', alignItems: 'center', gap: '1.2rem' }}>
                        <label style={{ minWidth: 'auto' }}>Enable Ticker</label>
                        <input
                            type='checkbox'
                            checked={ticker.tickerEnabled}
                            onChange={e => setTicker(p => ({ ...p, tickerEnabled: e.target.checked }))}
                            style={{ width: '1.8rem', height: '1.8rem', cursor: 'pointer', accentColor: ticker.tickerColor }}
                        />
                        <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.4)' }}>
                            {ticker.tickerEnabled ? '✓ Banner is visible to traders' : 'Banner is hidden'}
                        </span>
                    </div>
                    <div className='admin-form__row'>
                        <label>Message</label>
                        <textarea
                            value={ticker.tickerMessage}
                            onChange={e => setTicker(p => ({ ...p, tickerMessage: e.target.value }))}
                            placeholder='🚀 New signal bot released — grab it now from Free Bots! Limited slots available.'
                            rows={3}
                        />
                    </div>
                    <div className='admin-form__row'>
                        <label>Accent Color</label>
                        <div className='color-row__input'>
                            <input
                                type='color'
                                value={ticker.tickerColor}
                                onChange={e => setTicker(p => ({ ...p, tickerColor: e.target.value }))}
                            />
                            <input
                                type='text'
                                value={ticker.tickerColor}
                                onChange={e => setTicker(p => ({ ...p, tickerColor: e.target.value }))}
                                maxLength={9}
                            />
                        </div>
                    </div>
                    {ticker.tickerMessage.trim() && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '1rem 1.4rem',
                            background: '#080f1e',
                            borderRadius: '0.6rem',
                            border: `1px solid ${ticker.tickerColor}33`,
                            fontSize: '1.1rem',
                            color: 'rgba(255,255,255,0.7)',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                        }}>
                            <span style={{ color: ticker.tickerColor, marginRight: '0.8rem', fontWeight: 700 }}>◆ Preview:</span>
                            {ticker.tickerMessage}
                        </div>
                    )}
                    <div style={{ marginTop: '1.6rem' }}>
                        <button
                            className={`admin-btn admin-btn--primary ${tickerSaved ? 'admin-btn--saved' : ''}`}
                            onClick={handleTickerSave}
                        >
                            {tickerSaved ? '✓ Ticker Saved!' : 'Save Ticker'}
                        </button>
                    </div>
                </section>
            </div>

            <div className='customize-footer'>
                <button className={`admin-btn admin-btn--primary ${saved ? 'admin-btn--saved' : ''}`} onClick={handleSave}>
                    {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default SiteCustomization;
