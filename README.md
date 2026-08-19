# HealthConnect 🏥🤖
> **AI-Powered Telemedicine & Real-time Emergency Triage Platform**

HealthConnect is a modern, full-stack cross-platform healthcare application engineered for **Patients**, **Doctors**, and **Administrators**. Built with **React Native (Expo v57)** and powered by **Cloud Firestore** and **Firebase Authentication**, HealthConnect delivers real-time clinical consultations, digital health records management, doctor verification, and an intelligent **Banglish & English AI Assistant** for instant preliminary health triage and emergency guidance.

---

## 🌟 Key Features

### 🤖 1. AI Banglish Health Assistant & Emergency Triage
- **Multilingual Symptom Triage**: Accepts clinical symptom descriptions in **Banglish**, **English**, and **Bangla** (e.g., *"Amar 2 din dhore matha batha r jor"*).
- **Severity Detection & SOS Protocol**: Automatically flags critical symptoms (chest pain, shortness of breath, severe bleeding) and renders an emergency SOS banner with one-tap emergency calling (`999`).
- **Dynamic Contextual Prompts**: Generates smart, interactive follow-up prompt chips guiding patients to actionable clinical steps.

### 👨‍⚕️ 2. Doctor Directory & Instant Appointments
- **Specialty-Based Discovery**: Search and filter verified doctors by specialty (Cardiology, Dermatology, Pediatrics, General Medicine, etc.).
- **Real-Time Booking**: Interactive slot selection, live booking confirmations, and appointment tracking (Upcoming, Completed, Cancelled).
- **Ratings & Reviews**: View verified doctor ratings, experience years, and consultation fees.

### 💬 3. Real-Time Tele-Consultation & Clinical Chat
- **Instant Synchronization**: Real-time two-way messaging powered by **Cloud Firestore** `onSnapshot` subscriptions.
- **Health Vault Sharing**: Directly select and send PDF medical reports, lab results, and prescriptions inside the chat stream.
- **Encrypted & Private**: Secure communication channel with distinct UI styling for patients and doctors.

### 📂 4. Digital Health Vault & Patient Tools
- **Health Records Vault**: Upload, categorize, and securely manage personal medical documents and prescriptions.
- **Emergency Medical Card**: Digital patient profile with blood group, emergency contacts, and allergies, exportable to PDF via `expo-print`.
- **BMI Calculator**: Interactive Body Mass Index calculator with customized lifestyle and dietary tips.
- **Medicine Reminders**: Track and schedule daily medication regimens.
- **Nearest Hospital Finder**: GPS-assisted geolocation to locate nearby healthcare facilities via `expo-location`.

### 🛡️ 5. Master Admin Control Center
- **Live Database Telemetry**: Real-time counters for active patients, doctors, appointments, and pending reviews.
- **Doctor Credential Verification**: Review doctor licenses and credentials with one-tap approval/rejection.
- **User & Role Management**: Seamlessly manage platform users and elevate or adjust roles.
- **Health Article Editor**: Write, edit, and publish rich medical blogs to the community feed.
- **System Maintenance & Announcement Engine**: Remotely toggle platform maintenance mode or broadcast global banners in real-time.

---

## 🛠️ Complete Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React Native (0.86.2), React (19.2.3) | Core cross-platform UI framework |
| **Tooling & Platform** | Expo (v57.0.12) | Managed workflow, build toolchain & runtime |
| **Navigation** | React Navigation 7 (Stack & Bottom Tabs) | Role-based navigation with deep-linking support |
| **Backend as a Service** | Firebase v12.16.0 | Serverless infrastructure |
| **Authentication** | Firebase Auth + Google Sign-In SDK | Email/Password auth + Google OAuth 2.0 |
| **Database** | Cloud Firestore | Real-time NoSQL document database |
| **Storage** | Firebase Cloud Storage | Medical reports and asset storage |
| **Icons & Design** | `@expo/vector-icons` (Ionicons) | Unified icon set and design token palette |
| **Document Tools** | `expo-print` & `expo-sharing` | PDF rendering, printing, and file sharing |
| **Location Services** | `expo-location` | Geolocation for nearest hospital lookup |
| **Markdown Engine** | `react-native-markdown-display` | Rich markdown parsing in AI clinical triage |

---

## 📁 Repository Structure

```
HealthConnect/
├── App.js                         # Application root provider & web layout fixes
├── app.json                       # Expo configuration, plugins, and app metadata
├── eas.json                       # EAS Build profiles (preview APK / production)
├── google-services.json           # Firebase Android service credentials
├── package.json                   # Project dependencies and script shortcuts
├── assets/                        # App icons, splash graphics, and blog illustrations
│   └── images/                    # UI assets, avatars, and category covers
└── src/
    ├── components/                # 11 Reusable UI components
    │   ├── AppointmentCard.js     # Booking display card with status badge
    │   ├── Avatar.js              # Avatar with initials fallback & online dot
    │   ├── Badge.js               # Status badges (Verified, Pending, etc.)
    │   ├── BlogCard.js            # Article card with cover image & author
    │   ├── Button.js              # Standardized primary/secondary button
    │   ├── Card.js                # Base card container with elevation shadow
    │   ├── ChatBubble.js          # Chat message bubble with Markdown support
    │   ├── DoctorCard.js          # Doctor discovery & booking card
    │   ├── HealthVaultModal.js    # Bottom-sheet modal for vault document sharing
    │   ├── Input.js               # Form input with icon and error handling
    │   └── MedicineCard.js        # Medicine reminder schedule card
    │
    ├── context/
    │   └── AuthContext.js         # Global auth state provider & session manager
    │
    ├── navigation/                # Role-based navigation flows
    │   ├── AppNavigator.js        # Root stack router & maintenance interceptor
    │   ├── AuthNavigator.js       # Auth stack (Splash, Onboarding, Login, Register)
    │   ├── PatientTabs.js         # Patient 6-tab navigation bar
    │   ├── DoctorTabs.js          # Doctor 5-tab navigation bar
    │   └── AdminTabs.js           # Admin 4-tab control bar
    │
    ├── screens/                   # 43 Functional application screens
    │   ├── common/                # Shared & Authentication screens (10 screens)
    │   │   ├── ForgotPasswordScreen.js
    │   │   ├── HelpSupportScreen.js
    │   │   ├── LoginScreen.js
    │   │   ├── MaintenanceScreen.js
    │   │   ├── MessagesScreen.js
    │   │   ├── NotificationScreen.js
    │   │   ├── OnboardingScreen.js
    │   │   ├── RegisterScreen.js
    │   │   ├── RoleSelectionScreen.js
    │   │   └── SplashScreen.js
    │   │
    │   ├── patient/               # Patient portal screens (19 screens)
    │   │   ├── AppointmentConfirmScreen.js
    │   │   ├── BMICalculatorScreen.js
    │   │   ├── BlogDetailScreen.js
    │   │   ├── BlogFeedScreen.js
    │   │   ├── DoctorChatScreen.js
    │   │   ├── DoctorListScreen.js
    │   │   ├── DoctorProfileScreen.js
    │   │   ├── EditProfileScreen.js
    │   │   ├── EmergencyChatScreen.js
    │   │   ├── HealthRecordsScreen.js
    │   │   ├── HomeScreen.js
    │   │   ├── MedicalCardScreen.js
    │   │   ├── MedicineReminderScreen.js
    │   │   ├── MyAppointmentsScreen.js
    │   │   ├── NearestHospitalScreen.js
    │   │   ├── PrescriptionDetailScreen.js
    │   │   ├── PrivacyPolicyScreen.js
    │   │   ├── ProfileScreen.js
    │   │   └── SavedBlogsScreen.js
    │   │
    │   ├── doctor/                # Doctor portal screens (9 screens)
    │   │   ├── ConsultationSettingsScreen.js
    │   │   ├── DoctorAppointmentsScreen.js
    │   │   ├── DoctorHomeScreen.js
    │   │   ├── DoctorProfileSettingsScreen.js
    │   │   ├── IncomingRequestScreen.js
    │   │   ├── PatientChatScreen.js
    │   │   ├── PatientVaultScreen.js
    │   │   ├── PrescriptionScreen.js
    │   │   └── SetAvailabilityScreen.js
    │   │
    │   └── admin/                 # Admin control screens (5 screens)
    │       ├── AdminDashboardScreen.js
    │       ├── AdminSettingsScreen.js
    │       ├── BlogEditorScreen.js
    │       ├── DoctorVerificationScreen.js
    │       └── PatientDirectoryScreen.js
    │
    ├── services/                  # Business logic & Firebase abstractions
    │   ├── aiService.js           # Banglish/English Clinical Triage engine
    │   ├── appointmentsApi.js     # Appointment bookings & status updates
    │   ├── blogsApi.js            # Article publishing, liking & bookmarks
    │   ├── doctorsApi.js          # Doctor profiles & availability queries
    │   ├── firebase.js            # Firebase SDK configuration & initialization
    │   └── notificationService.js # In-app notification dispatcher & listeners
    │
    └── utils/                     # Design tokens & asset resolution
        ├── blogAssets.js          # Blog cover image mapping & fallback loader
        └── colors.js              # Centralized color tokens & theme definitions
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) installed on your iOS / Android device

---

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/Nibir-Ahmed/HealthConnect-AI.git
cd HealthConnect-AI/HealthConnect

# Install dependencies
npm install
```

---

### 2. Run in Development Mode

```bash
# Start the Expo development server
npm start
# or
npx expo start
```

- **Android Device / Emulator**: Press `a` in the terminal or scan the QR code with **Expo Go**.
- **iOS Device / Simulator**: Press `i` in the terminal or scan the QR code with the iOS Camera app.
- **Web Browser**: Press `w` in the terminal to launch the web client at `http://localhost:8081`.

---

## 📦 Building Standalone Android APK

To build a standalone installable `.apk` file for Android devices:

1. Install the EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Authenticate with your Expo account:
   ```bash
   eas login
   ```
3. Run the cloud preview build:
   ```bash
   npx eas build -p android --profile preview
   ```
4. Download the generated `.apk` and install it on your device.

---

## 🔐 Default Admin Credentials

For testing and administrative evaluation:
- **Email**: `admin@healthconnect.com`
- **Password**: `123456`

*(Admin portal accounts are automatically bootstrapped with full privileges upon first login).*

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:
1. Fork the Project Repository.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
