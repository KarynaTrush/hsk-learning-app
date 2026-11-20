# Adaptive Chinese Language Learning Platform 🇨🇳✨

An interactive, aesthetics-driven Mandarin Chinese learning web application tailored to the **HSK 2.0 (Levels 0–6)** standards. Built with a focus on an elegant traditional visual style, seamless UX, and smart ML-powered progress tracking.

🌐 **Live Demo:** [hsk-learning-app-feon.vercel.app](https://hsk-learning-app-feon.vercel.app)

Developed as a Bachelor's Engineering Thesis at **Politechnika Opolska** (*Design and implementation of an adaptive educational content recommendation system using machine learning methods*). 🎓💻

**Author:** Karyna Trush

---

## ✨ Features & Vibes

* 🧠 **AI-Driven Personalization & ML Recommendations:** Tailored daily study plans and lesson suggestions driven by mistake-based analysis and vocabulary retention metrics across all skills.
* 🗺️ **HSK 2.0 Knowledge Map (Levels 0–6):** Structured lessons combining vocabulary, listening, pinyin, translation, sentence building, and interactive grammar exercises.
* 🎙️ **Real-Time Tone Visualizer:** Interactive voice pitch analyzer utilizing Bezier SVG curves and the Web MediaRecorder API to compare your speech against native standard patterns (Tones I–IV).
* 🖌️ **Calligraphy & Stroke Order Practice:** Step-by-step character writing trainer powered by `hanzi-writer` on authentic *Mi-zi-ge* (米字格) grids with complete metadata (Pinyin, Radicals, Meanings).
* 🔁 **Smart SRS & Error Analytics:** Built-in Spaced Repetition System (SM-2) tracker alongside dedicated error management dashboards, daily goals, activity calendar, and achievement badges.
* 📖 **Reading & Grammar Library:** Graded reading stories with interactive vocabulary hints and a structured grammar reference with mini-quizzes.
* 🎨 **Immersive Chinese Aesthetics & Multilingual UI:** Specialized paper-wash visual design available in **English**, **Polish**, and **Russian**.

---

## 🛠️ Tech Stack

* ⚡ **Frontend:** React (ES6+, JSX), Vite (Fast HMR compilation), CSS Modules, `i18next` (EN / PL / RU)
* 🎯 **Visuals & Interactive Tools:** `hanzi-writer`, Recharts (data-driven analytics), Lucide React, Web MediaRecorder API
* 🔐 **Backend & Database:** Supabase (PostgreSQL, Authentication, Avatar Storage, Row Level Security)
* 🤖 **Machine Learning (`ml/`):** Python, `scikit-learn`, `pandas` — offline student learning simulation and recommendation policy evaluation

---

## 📂 Project Structure

```text
hsk-learning-app/
├── src/                  # React frontend source code (pages, components, hooks, i18n, styles)
├── data/                 # HSK 2.0 vocabulary (words.csv), PostgreSQL schemas, and content seed scripts
├── ml/                   # Isolated Python ML experiment & recommendation simulation framework
├── scripts/              # Utility scripts for translation management and project structure checks
├── .env.example          # Environment variable template
└── package.json          # Project dependencies and build scripts
```

---

## 🗄️ Database & ML Setup

* 🐘 **Supabase Database:** Execute the SQL scripts located in `data/` in the following order: `create_words_table`, `create_content_tables`, `seed_lessons_hsk1_2`, `seed_texts`, `seed_texts_more`, `seed_meanings_hsk1_2`, `seed_lesson_blocks`, `fix_signup_trigger`, `v2_schema`, `seed_hsk0`, `seed_hsk1_content`, `v3_grammar`, `v5_schema`, `seed_grammar_theory`. Import the vocabulary list from `data/words.csv` via the Supabase Table Editor.
* 🧪 **ML Simulation (`ml/`):** The offline recommendation system experiment runs in an isolated Python environment. Check `ml/README.md` for full setup and evaluation details.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18 or higher) installed on your system and an active **Supabase** project.

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KarynaTrush/hsk-learning-app.git
   cd hsk-learning-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` inside `.env.local`.

4. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:5173` (or the port specified in your terminal) to view the application.