# 📱 PrintPress Android Build Guide

This guide explains how to build the PrintPress Android APK for Google Play Store.

## Prerequisites

### Required Software
1. **Android Studio** - [Download](https://developer.android.com/studio)
2. **Node.js 18+** - Already installed ✅
3. **JDK 17+** - Comes with Android Studio

### Environment Setup
After installing Android Studio:
1. Open Android Studio
2. Go to **File > Settings > Appearance & Behavior > System Settings > Android SDK**
3. Install **Android SDK Platform 33** (Android 13)
4. Install **Android SDK Build-Tools 33+**
5. Add Android SDK to PATH (usually `C:\Users\<username>\AppData\Local\Android\Sdk`)

## Setup Steps

### Step 1: Install Dependencies
```bash
cd client
npm install
```

### Step 2: Build the Web App
```bash
npm run build
```

### Step 3: Initialize Capacitor (First Time Only)
```bash
npx cap init PrintPress com.printpress.app
npx cap add android
```

### Step 4: Sync Web Assets to Android
```bash
npx cap sync android
```

### Step 5: Open in Android Studio
```bash
npx cap open android
```

## Building APK

### Debug APK (For Testing)
In Android Studio:
1. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Find APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (For Play Store)

#### 1. Generate a Keystore (One Time)
```bash
keytool -genkey -v -keystore printpress-release.keystore -alias printpress -keyalg RSA -keysize 2048 -validity 10000
```
**⚠️ Keep this keystore safe! You need it for all future updates.**

#### 2. Create `android/keystore.properties`
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=printpress
storeFile=../printpress-release.keystore
```

#### 3. Update `android/app/build.gradle`
Add before `android {`:
```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
```

Add inside `android {`:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

#### 4. Build Release APK
```bash
cd android
./gradlew assembleRelease
```
Find APK at: `android/app/build/outputs/apk/release/app-release.apk`

## Play Store Upload

### Required Assets
| Asset | Size | Format |
|-------|------|--------|
| App Icon | 512x512 | PNG |
| Feature Graphic | 1024x500 | PNG |
| Phone Screenshots | 1080x1920 | PNG (min 2, max 8) |
| Tablet Screenshots | 2560x1440 | PNG (optional) |

### Play Console Checklist
- [ ] App title (30 chars max)
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] App category: Shopping / Education
- [ ] Content rating questionnaire
- [ ] Privacy policy URL
- [ ] Target audience age

### Upload Steps
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill in store listing details
4. Upload APK/AAB to Production track
5. Complete content rating
6. Set pricing & distribution
7. Submit for review

## Troubleshooting

### "SDK location not found"
Create `android/local.properties`:
```properties
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

### "Gradle build failed"
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### "Cannot find module @capacitor/core"
```bash
cd client
npm install @capacitor/core @capacitor/cli @capacitor/android
```

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm run build:mobile` | Build web + sync to Android |
| `npm run android` | Open Android Studio |
| `npm run cap:sync` | Sync web assets to Android |
| `npm run android:build` | Build debug APK |
| `npm run android:release` | Build release APK |

---

**Need help?** Check [Capacitor Docs](https://capacitorjs.com/docs/android)
