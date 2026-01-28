/**
 * Capacitor App Initialization
 * Handles splash screen, status bar, and mobile-specific setup
 */

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Hook to initialize Capacitor plugins
 * Call this in your App component
 */
export function useCapacitorInit() {
    useEffect(() => {
        const initApp = async () => {
            // Only run on native platforms
            if (!Capacitor.isNativePlatform()) return;

            try {
                // Configure status bar
                await StatusBar.setStyle({ style: Style.Dark });
                await StatusBar.setBackgroundColor({ color: '#f59e0b' });

                // Hide splash screen after app loads
                await SplashScreen.hide({
                    fadeOutDuration: 300,
                });
            } catch (error) {
                console.error('Capacitor init error:', error);
            }
        };

        initApp();
    }, []);
}

/**
 * Check if running on native platform
 */
export function isNativePlatform() {
    return Capacitor.isNativePlatform();
}

/**
 * Get current platform
 */
export function getPlatform() {
    return Capacitor.getPlatform();
}

/**
 * Check if running on Android
 */
export function isAndroid() {
    return Capacitor.getPlatform() === 'android';
}

/**
 * Check if running on iOS
 */
export function isIOS() {
    return Capacitor.getPlatform() === 'ios';
}

/**
 * Check if running in browser
 */
export function isWeb() {
    return Capacitor.getPlatform() === 'web';
}
