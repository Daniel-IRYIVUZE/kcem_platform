# EcoTrade Rwanda — Mobile Application

EcoTrade Rwanda is a Flutter-based mobile application for Android, iOS, and Web. It serves as the companion app to the EcoTrade web platform, providing waste generators, recyclers, drivers, and hotel partners with a native mobile experience. The app features role-based screens, real OpenStreetMap maps via `flutter_map`, Riverpod state management, live FastAPI backend connectivity, and a fully polished UI with Material icons throughout (zero emojis).

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Available Targets](#available-targets)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Features by Role](#features-by-role)
- [Build for Release](#build-for-release)
- [Known Issues](#known-issues)
- [License](#license)

---

## Introduction

The mobile app is built with Flutter using Dart. It uses Riverpod for state management, go_router for navigation, and the HTTP package for REST API communication with the FastAPI backend at `http://localhost:8000/api`. All map screens use real OpenStreetMap tiles via `flutter_map` — no fake placeholder maps remain. The app falls back to locally cached data when the backend is unreachable.

---

## Prerequisites

Before running the mobile application, ensure the following are installed on your machine:

- Flutter SDK version 3.2.0 or higher
- Dart SDK version 3.2.0 or higher (bundled with Flutter)
- Android Studio or Xcode (for Android or iOS builds respectively)
- A connected physical device, an Android/iOS emulator, or a Windows desktop environment
- Git

To verify your Flutter installation:

```bash
flutter --version
flutter doctor
```

Run `flutter doctor` and resolve any issues reported before continuing.

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Daniel-IRYIVUZE/EcoTrade_Rwanda.git
cd EcoTrade_Rwanda/mobile
```

2. Install Flutter dependencies:

```bash
flutter pub get
```

> Code generation with `build_runner` is not required — the project does not use Hive type adapters or other generated files.

---

## Running the Application

### Step 1: Check available devices

List all connected devices and emulators:

```bash
flutter devices
```

### Step 2: Run on a specific device

Replace `<device-id>` with the device ID shown from the command above:

```bash
flutter run -d <device-id>
```

### Run on Android emulator

Start an Android emulator from Android Studio, then:

```bash
flutter run -d android
```

### Run on iOS simulator (macOS only)

Open the iOS Simulator application, then:

```bash
flutter run -d ios
```

### Run on Windows desktop

```bash
flutter run -d windows
```

### Run in debug mode with verbose output

```bash
flutter run --verbose
```

---

## Available Targets

| Platform   | Command                      | Notes                          |
|------------|------------------------------|--------------------------------|
| Android    | flutter run -d android       | Requires Android emulator or device |
| iOS        | flutter run -d ios           | macOS only, requires Xcode     |
| Windows    | flutter run -d windows       | Windows 10 or higher required  |
| Web        | flutter run -d chrome        | Experimental web support       |

---

## Project Structure

```
mobile/
├── lib/
│   ├── main.dart                  # Application entry point
│   ├── core/
│   │   ├── models/                # Shared data models
│   │   ├── providers/             # Global Riverpod providers
│   │   ├── router/                # go_router route configuration
│   │   ├── services/              # API and local storage services
│   │   └── theme/                 # App theme and color definitions
│   └── features/
│       ├── auth/                  # Login, registration, OTP screens
│       ├── driver/                # Driver dashboard and route screens
│       ├── hotel/                 # Hotel partner waste management screens
│       ├── onboarding/            # First-time user onboarding flow
│       ├── recycler/              # Recycler dashboard and marketplace
│       ├── shared/                # Shared widgets and utilities
│       └── splash/                # Splash screen
├── assets/
│   ├── animations/                # Lottie animation files
│   ├── fonts/                     # Custom font files
│   ├── icons/                     # App icons
│   └── images/                    # Static image assets
├── android/                       # Android-specific configuration
├── windows/                       # Windows-specific CMake build files
├── web/                           # Web build artifacts
├── pubspec.yaml                   # Flutter package configuration
└── analysis_options.yaml          # Dart linting configuration
```

---

## Technology Stack

| Layer | Package | Version |
|--------------------|------------------------------|-----------|
| Framework | Flutter | 3.2.0+ |
| Language | Dart | 3.2.0+ |
| State Management | flutter_riverpod | 2.5.1 |
| Navigation | go_router | 13.2.0 |
| HTTP Client | http | 1.2.0 |
| Maps | flutter_map | 6.1.0 |
| Map Coordinates | latlong2 | 0.9.1 |
| Fonts | google_fonts | 6.2.1 |
| Animations | flutter_animate | 4.5.0 |
| Charts | fl_chart | 0.67.0 |
| Notifications | flutter_local_notifications | 17.2.1 |
| Geo-location | geolocator | 11.0.0 |
| Image Picker | image_picker | 1.0.7 |
| OTP Input | pinput | 5.0.0 |
| Session Storage | shared_preferences | 2.2.3 |
| Local Storage | hive_flutter | 1.1.0 |
| Relational Storage | sqflite | 2.3.3 |
| QR Code | qr_flutter | 4.1.0 |

---

## Features by Role

### Authentication (All Roles)
- Email and password login with styled toast error alerts
- Registration flow with role selection and interactive map-based location picker
- Session persistence using shared_preferences
- `EcoTrade.png` logo on the login screen

### Onboarding
- Multi-step carousel with smooth page indicators
- Material icons throughout — no emojis
- Overflow-safe layout with SingleChildScrollView

### Splash Screen
- `EcoTrade Portait.png` animated logo on the original gradient background
- 5-stage animation: fade-in → elastic scale → shimmer → pulse up → pulse down

### Real OpenStreetMap Maps (flutter_map + OpenStreetMap tiles)
- **Register screen** — tap-to-place location marker; tapping moves the pin
- **Driver navigation** — live route map with stop markers, zoom controls, driver position, and progress overlay
- **Recycler home** — non-interactive 190px preview map centered on Kigali with listing pins
- **Marketplace map view** — all listings plotted at real hotel latitude/longitude from the API; card strip below the map
- **List Waste screen (Hotel)** — 160px interactive map for picking pickup location; tap anywhere to move the pin

### Driver
- Daily collection schedule with real OpenStreetMap route map
- Earnings history and statements

### Hotel Partner
- Waste listing creation and management
- Interactive pickup location map (tap-to-pin)
- Green Score sustainability tracking
- Transaction and invoice history

### Recycler
- Browse and bid on available waste listings
- Marketplace map view with real coordinates from the backend
- Inventory management and supplier network
- Financial dashboard with payment history

---

## Build for Release

### Android APK

```bash
flutter build apk --release
```

The output APK will be located at: `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (for Play Store)

```bash
flutter build appbundle --release
```

### iOS (macOS only)

```bash
flutter build ios --release
```

### Windows

```bash
flutter build windows --release
```

The output executable will be located at: `build/windows/x64/runner/Release/`

---

## Known Issues

- iOS build requires a valid Apple Developer account and provisioning profile for device deployment.
- `flutter run -d chrome` (web) is supported for demo purposes; some native plugins (geolocator, image_picker) have limited functionality in the browser.
- The `flutter_map` tile layer requires an internet connection to load OpenStreetMap tiles.

---

## License

MIT License. See the LICENSE file in the root of the repository for details.
