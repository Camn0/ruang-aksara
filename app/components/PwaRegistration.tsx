'use client';

import { useEffect } from 'react';

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