# 🕵️ TruthCheck.AI - Multimodal AI Verification System

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=render)](https://truthcheck-ai-1-tiqp.onrender.com/)

**TruthCheck.AI** is a premium, full-stack web application designed to combat the digital epidemic of misinformation. Unlike standard fact-checkers, TruthCheck uses multimodal AI to analyze **News Headlines, Visual Media (Images/Videos), and Job Offers** to ensure you only trust what is real.

---

## 🚀 Key Features

### 1. 📰 News Verification
- **AI Analysis:** Instant verification of news claims using **Gemini 1.5 Flash** and **Llama 3.1**.
- **Contextual Awareness:** Cross-references headlines with thousands of trusted global sources.
- **Verdict & Confidence:** Get a definitive status (REAL, FAKE, or SATIRE) with an AI-generated confidence score.

### 2. 🎞️ Deepfake & AI Media Detection
- **Pixel Forensics:** Detects artifacts, unnatural lighting, and GAN fingerprints in images and short videos.
- **Visual Evidence:** Analyzes if media was generated or heavily manipulated by AI tools like Sora or Midjourney.

### 3. 💼 Job Scam Scanner
- **Red Flag Detection:** Scans job descriptions and screenshots for signs of recruitment fraud (unrealistic pay, suspicious contacts).
- **Protection:** Helps users avoid phishing attempts and financial scams.

### 4. 🌍 Global & India News Feed
- **Real-time Aggregation:** Live news feeds from the **GNews API**, categorized into International and Indian contexts.
- **Trending Updates:** Stay informed with the most relevant verified headlines.

### 5. 💎 Premium UI/UX Features
- **Glassmorphism & Gradients:** A stunning, modern interface with high-performance visuals.
- **Modal-Based Results:** Detailed analysis shown in a blurred, immersive popup.
- **PDF Reports:** Download a professional verification report for any analysis.
- **Theme Switcher:** Seamlessly switch between Sun (Light) and Moon (Dark) modes.
- **Real-time Clock:** Live date and time tracking in the navigation bar.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, Tailwind CSS (Vanilla JS), Lucide-style iconography.
- **Backend:** Node.js, Express.js.
- **AI Brain:** Google Gemini AI & Groq (Llama 3).
- **Media Handling:** Multer for file processing.
- **Report Generation:** jspdf & html2canvas.

---

## 🔑 Getting Your API Keys

To run TruthCheck.AI, you need keys for the following services:

1. **Gemini API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/).
   - Click **"Get API key"**.
2. **Groq API Key:**
   - Visit [Groq Cloud Console](https://console.groq.com/keys).
   - Create a new API key.
3. **GNews API Key:**
   - Sign up at [GNews.io](https://gnews.io/) to get your free key for live news.

---

## 💻 Installation Guide (For New Users)

Follow these steps to set up the project on a new computer:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) and [Git](https://git-scm.com/) installed.

### 2. Clone the Repository
```bash
git clone https://github.com/piyushmauryacodes/truthcheck-ai.git
cd truthcheck-ai
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a file named `.env` in the root directory and add your keys:
```env
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
GNEWS_API_KEY=your_gnews_key_here
PORT=3000
```

### 5. Start the Application
```bash
npm start
```
Open your browser and go to: `http://localhost:3000`

---

## 🌍 Deployment Guide (Go Live)

### Step 1: Push to GitHub
1. Initialize Git (if not already): `git init`
2. Create `.gitignore` and add `.env` and `node_modules`.
3. Push to your repo:
   ```bash
   git add .
   git commit -m "Upgrade: Premium UI, Multimodal Detection, and PDF Reports"
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Render.com
1. Create a **New Web Service** and connect your GitHub repo.
2. **Build Command:** `npm install`
3. **Start Command:** `node server.js`
4. **Environment Variables:** Add your `GEMINI_API_KEY`, `GROQ_API_KEY`, and `GNEWS_API_KEY` in the Render dashboard settings.

---

## 📄 License
This project is open-source and available under the **MIT License**.

**Designed and Developed by [PIYUSH MAURYA](https://github.com/piyushmauryacodes) with AI** 🚀
