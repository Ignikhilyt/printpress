import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
    appId: 'com.printpress.app',
    appName: 'PrintPress',
    webDir: 'dist',
    server: {
        androidScheme: 'https',
        // Uncomment and set your production API URL when deploying
        // url: 'https://api.printpress.com',
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: '#f59e0b',
            androidSplashResourceName: 'splash',
            androidScaleType: 'CENTER_CROP',
            showSpinner: false,
            splashFullScreen: true,
            splashImmersive: true,
        },
        StatusBar: {
            style: 'DARK',
            backgroundColor: '#f59e0b',
        },
        Keyboard: {
            resize: 'body',
            style: 'DARK',
            resizeOnFullScreen: true,
        },
    },
    android: {
        allowMixedContent: true,
        captureInput: true,
        webContentsDebuggingEnabled: false, // Set to true for debugging
    },
};

export default config;
