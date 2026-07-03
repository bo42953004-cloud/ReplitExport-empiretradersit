// Shared logo + app name "mark" rendered in the header (desktop & mobile, next to the
// hamburger) and in the mobile drawer. Logo priority:
//   1. Admin portal logoUrl (global, server-persisted)
//   2. Live App Builder preview data URL
//   3. public/logo.<png|jpg|jpeg|webp>
//   4. Letter-badge fallback
// Name priority: admin siteName → preview name → build-time name.
import { useContext, useEffect, useMemo, useState } from 'react';
import {
    getPreviewAppName,
    getPreviewLogo,
    subscribePreviewAppName,
    subscribePreviewLogo,
} from '@/utils/live-branding-store';
import { isPreviewMode } from '@/utils/is-preview-mode';
import { getAppName, LOGO_CANDIDATES } from '../../../utils/branding';
import { AdminPortalContext } from '../../admin-portal/AdminPortalContext';

type TLogoMarkProps = {
    height?: number;
};

export const LogoMark = ({ height = 32 }: TLogoMarkProps) => {
    const adminCtx = useContext(AdminPortalContext);
    const adminSettings = adminCtx?.settings;

    const [previewLogo, setPreviewLogo] = useState<string | null>(getPreviewLogo());
    const [previewAppName, setPreviewAppName] = useState<string | null>(getPreviewAppName());
    const [candidateIndex, setCandidateIndex] = useState(0);

    useEffect(() => subscribePreviewLogo(setPreviewLogo), []);
    useEffect(() => subscribePreviewAppName(setPreviewAppName), []);

    // Admin logo wins, then preview data URL, then public/logo.* file candidates.
    const candidates = useMemo(() => {
        const adminLogo = adminSettings?.logoUrl || null;
        const fileFallbacks = isPreviewMode() ? [] : LOGO_CANDIDATES;
        if (adminLogo) return [adminLogo, ...fileFallbacks];
        return previewLogo ? [previewLogo, ...fileFallbacks] : [...fileFallbacks];
    }, [adminSettings?.logoUrl, previewLogo]);

    // Restart probing whenever the candidate list changes (e.g. a new logo uploaded).
    useEffect(() => setCandidateIndex(0), [candidates]);

    // Admin name wins, then preview name, then build-time name.
    const appName = (adminSettings?.siteName && adminSettings.siteName !== 'Trading Bot'
        ? adminSettings.siteName
        : null) ?? previewAppName ?? getAppName();

    const logoSrc = candidateIndex < candidates.length ? candidates[candidateIndex] : null;
    const badgeLetter = appName.trim().charAt(0).toUpperCase() || 'A';

    return (
        <span className='app-header__logo-mark'>
            {logoSrc ? (
                <img
                    data-logo
                    src={logoSrc}
                    alt={appName}
                    className='app-header__logo-img'
                    style={{ height: `${height}px` }}
                    onError={() => setCandidateIndex((index) => index + 1)}
                />
            ) : (
                <span
                    className='app-header__logo-badge'
                    style={{ height: `${height}px`, width: `${height}px` }}
                    aria-hidden='true'
                >
                    {badgeLetter}
                </span>
            )}
            <span className='app-header__logo-text app-header__logo-text--animated'>
                {appName}
            </span>
        </span>
    );
};
