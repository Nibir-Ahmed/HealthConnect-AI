# HealthConnect 🏥🤖
> **AI-Powered Telemedicine & Real-time Emergency Triage Platform**

HealthConnect is an open-source, full-stack cross-platform healthcare application built for **Patients**, **Doctors**, and **Administrators**. Powered by **React Native (Expo)**, **Node.js (Express)**, **Socket.io**, **Firebase**, and **GROQ LLM Engine**, HealthConnect provides real-time doctor consultations, medical vault management, and an intelligent **Banglish & English AI Assistant** for instant preliminary health triage.

---

## 🌟 Key Features

### 🤖 1. AI Banglish Health Assistant
- **Multilingual Symptom Triage**: Accepts symptoms in **Banglish**, English, or Bangla (e.g., *"Amar 2 din dhore matha batha r jor"*).
- **Severity Assessment**: Categorizes triage level (`normal`, `warning`, `emergency`).
- **Dynamic Follow-Up Prompts**: Generates contextual follow-up questions for accurate preliminary advice.

### 👨‍⚕️ 2. Doctor Directory & Appointments
- **Specialty Filter**: Browse doctors by specialty (Cardiologist, Pediatrician, Dermatologist, etc.).
- **Slot Availability**: Select available slots and confirm appointments seamlessly.
- **Booking Management**: View past, upcoming, and canceled appointment status.

### 💬 3. Real-Time Consultation & Chat
- **Dual Chat Sync**: Real-time communication via **Socket.io** and **Firebase Firestore**.
- **Attachment Sharing**: Share medical records, prescriptions, and health vault PDFs directly inside chat bubbles.

### 📂 4. Digital Health Vault & Tools
- **Health Records Vault**: Upload, view, and share medical reports.
- **BMI Calculator**: Calculate Body Mass Index with tailored health tips.
- **Medicine Reminders**: Track daily medication schedules.
- **Medical Card**: Digital patient emergency profile card.

### 🛡️ 5. Master Admin Portal
- **Doctor Verification**: Review and approve doctor license credentials.
- **Health Article Editor**: Publish and manage blog articles in the Health Article Library.
- **User Directory**: Platform-wide user management.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Mobile / Web** | React Native (Expo v57), React Navigation 7, Expo Vector Icons |
| **Backend REST API** | Node.js, Express.js 5 |
| **Real-time Messaging** | Socket.io 4, Firebase Firestore |
| **Database & ORM** | Sequelize (SQLite / MySQL) |
| **Authentication** | Firebase Auth (Patient / Doctor / Admin) |
| **AI LLM Engine** | GROQ SDK (`llama-3.3-70b-versatile`) |
| **File Storage** | Multer Local Uploads & Static Express Server |

---

## 📁 Repository Structure

```
HealthConnect/
├── HealthConnect-Backend/        # Express REST API & Socket server
│   ├── src/
│   │   ├── config/               # Database connection & Sequelize models
│   │   ├── controllers/          # Auth, AI Triage, Doctors, Appointments, Chat logic
│   │   ├── middleware/           # JWT & File upload middlewares
│   │   ├── models/               # User, Doctor, Appointment, Blog Sequelize models
│   │   ├── routes/               # Express API routes
│   │   └── index.js              # Server entry point
│   ├── uploads/                  # Uploaded medical records & blog cover images
│   └── .env.example              # Environment variables template
│
└── HealthConnect-Frontend/       # Expo React Native App (Android, iOS, Web)
    ├── assets/                   # App icons, splash screens, and avatars
    ├── src/
    │   ├── components/           # Reusable UI components (Avatar, DoctorCard, ChatBubble)
    │   ├── context/              # AuthContext for Firebase & JWT auth state
    │   ├── navigation/           # AppNavigator, PatientTabs, DoctorTabs, AdminTabs
    │   ├── screens/              # Patient, Doctor, Admin, and Common screens
    │   ├── services/             # Axios API client & Firebase config
    │   └── utils/                # Dynamic host config, colors, and helpers
    └── .env.example              # Frontend environment variables template
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go App](https://expo.dev/go) installed on your Android/iOS device.

---

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/HealthConnect.git
cd HealthConnect
```

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd HealthConnect-Backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Fill in your environment variables in `.env`:
   ```env
   PORT=5001
   JWT_SECRET=supersecretjwtkey123!
   GROQ_API_KEY=your_groq_api_key_here
   SKIP_DB_SYNC=true
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5001`.*

---

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd HealthConnect-Frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development bundler:
   ```bash
   npx expo start --lan
   ```

---

## 📱 Running on Your Phone

1. Install **Expo Go** on your phone ([Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)).
2. Connect your phone and laptop to the **same Wi-Fi network**.
3. Scan the terminal **QR Code**:
   - **Android**: Tap **Scan QR Code** inside the Expo Go app.
   - **iPhone**: Open default **Camera app** and tap the notification banner.

---

## 📦 Building Standalone Android APK

To build a standalone installable `.apk` file for Android:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Run the build command inside `HealthConnect-Frontend`:
   ```bash
   npx eas build -p android --profile preview
   ```
3. Download the generated `.apk` file link and install it directly on your Android phone!

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
