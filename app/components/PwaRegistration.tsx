/**
 * @file PwaRegistration.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Platform Infrastructure architecture.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { useEffect } from 'react';

/**
 * PwaRegistration: Encapsulates the explicit React DOM lifecycle and state-management for the pwa registration interactive workflow.
 */
export default function PwaRegistration() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js').then(
                    function (registration) {
                        console.log('Ruang Aksara SW registered: ', registration.scope);
                    },
                    function (err) {
                        console.log('Ruang Aksara SW registration failed: ', err);
                    }
                );
            });
        }
    }, []);

    return null;
}