import { useCallback } from 'react';
import { clearAllAuthData } from '@/external/deriv-core';
import { useStore } from '@/hooks/useStore';
import { ErrorLogger } from '@/utils/error-logger';

/**
 * Custom hook to handle logout functionality
 * Clears all session and local storage to reset the session
 * @returns {Function} handleLogout - Function to trigger the logout process
 */
export const useLogout = () => {
    const { client } = useStore() ?? {};

    return useCallback(async () => {
        try {
            // Call the client store logout method which clears all storage
            await client?.logout();
            // Analytics.reset() removed - Analytics package has been removed from the project
            // See migrate-docs/MONITORING_PACKAGES.md for re-enabling analytics if needed
        } catch (error) {
            ErrorLogger.error('Logout', 'Logout failed', error);
            // If logout fails, clear only auth-related storage keys
            // This preserves user preferences (theme, language, etc.) while ensuring auth data is cleared
            try {
                // Clear all auth data via vendored deriv-core (covers auth_info,
                // oauth_csrf_token, oauth_code_verifier, deriv_accounts, active_loginid, account_type)
                clearAllAuthData();

                // Clear legacy keys that older code may have written
                localStorage.removeItem('authToken');
                localStorage.removeItem('accountsList');
                localStorage.removeItem('clientAccounts');
            } catch (storageError) {
                ErrorLogger.error('Logout', 'Failed to clear auth storage', storageError);
                // Last resort: if targeted clearing fails, clear all storage
                try {
                    sessionStorage.clear();
                    localStorage.clear();
                } catch (finalError) {
                    ErrorLogger.error('Logout', 'Failed to clear all storage', finalError);
                }
            }
        }
    }, [client]);
};
