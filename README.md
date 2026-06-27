# HSK Learning Platform 🇨🇳

An interactive, aesthetics-driven Mandarin Chinese learning web application tailored to the new HSK 3.0 standards. Built with a focus on elegant traditional visual style, seamless user experience, and smart progress tracking.

---

## ✨ Features

* **AI-Driven Personalization:** Tailored lesson recommendations based on recent vocabulary retention and mistaked-based analysis.
* **Real-Time Tone Visualizer:** Interactive voice pitch visualizer utilizing Bezier SVG curves comparing user speech against native standard patterns (Tones I–IV).
* **Calligraphy Practice Guide:** Step-by-step stroke order animation using authentic Mi-zi-ge (米字格) grids with complete metadata (Pinyin, Radical, Meanings).
* **Smart SRS Reviews:** Built-in Spaced Repetition System tracker alongside dedicated error management dashboards ("Moje Błędy").
* **Immersive Visual Design:** Crafted with a specialized "Chinese Aesthetics Palette" optimized for both light paper-wash styles and eye-friendly dark modes.

---

## 🛠️ Tech Stack

* **Frontend:** React (Clean JavaScript ES6+, JSX)
* **Build Tool:** Vite (Fast HMR compilation)
* **Styling:** Tailwind CSS v4 (Modern `@import` unified theme engine)
* **Icons:** Lucide React
* **Charts:** Recharts (Data-driven analytics and progress bars)
* **Animations:** Motion / React (Framer Motion)

---
src/
├── app/
│   ├── components/      # Main interactive application views & screens
│   └── styles/          # Core styling stylesheets (V4 Tailwind configuration, fonts, themes)
├── main.jsx             # Entry point initializing the unified index.css engine
└── App.jsx              # Core application router and screen manager



## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18 or higher) installed on your system.

### Installation

 **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd hsk-learning-app


1. Install dependencies:
    npm install

2. Run the local development server:
    npm run dev

3. Open your browser:
    Navigate to http://localhost:5173 (or the port specified in your terminal) to view the application.
