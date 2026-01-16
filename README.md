# 🕵️ TruthCheck.AI - Fake News Detection System

**TruthCheck.AI** is a full-stack web application designed to combat misinformation. It uses advanced Generative AI (Llama 3.1 via Groq) to analyze news headlines and determine if they are likely **Real**, **Fake**, or **Satire**. It also features a live news feed aggregating top stories from India and the World.

---

## 🚀 Features

* **AI Analysis:** Instant verification of claims using the Llama 3.1 LLM.
* **Live News Feed:** Real-time headlines from the GNews API (India & World).
* **Smart Detection:** Classifies news with a confidence score and provides context.
* **Modern UI:** Responsive design with **Tailwind CSS** and Dark Mode support.
* **Report Export:** Download analysis results as images.

---

## 🛠️ Prerequisites

Before running this project, ensure you have the following installed:

* [Node.js](https://nodejs.org/) (v18 or higher)
* [Git](https://git-scm.com/)

---

## 🔑 Getting Your API Keys

This project requires **two free API keys** to function.

1. **Groq API Key (The AI Brain):**
* Visit [Groq Cloud Console](https://console.groq.com/keys).
* Sign up/Login and click **Create API Key**.
* Copy the key starting with `gsk_`.


2. **GNews API Key (The Live News):**
* Visit [GNews.io](https://gnews.io/).
* Sign up and copy your API Key from the dashboard.



---

## 💻 Installation Guide (Run Locally)

Follow these steps to run the project on your own computer.

### 1. Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/piyushmauryacodes/truthcheck-ai.git
cd truthcheck-ai

```

### 2. Install Dependencies

Install the required Node.js libraries:

```bash
npm install

```

### 3. Configure Environment Variables

1. Create a new file named `.env` in the root folder.
2. Paste the following inside and replace the placeholders with your actual keys:

```env
GROQ_API_KEY=your_actual_groq_key_here
GNEWS_API_KEY=your_actual_gnews_key_here
PORT=3000

```

### 4. Run the Application

Start the server:

```bash
npm start

```

You should see:

> Server running on port 3000

Open your browser and visit: `http://localhost:3000`

---

## 🌍 Deployment Guide (Go Live)

This project was deployed using **GitHub** and **Render** (Free Tier). Here is the exact process used:

### Step 1: Push to GitHub

1. Initialize Git: `git init`
2. Create a `.gitignore` file and add `.env` and `node_modules` to it (Crucial security step!).
3. Commit changes:
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/piyushmauryacodes/truthcheck-ai.git
git push -u origin main

```



### Step 2: Deploy on Render

1. Create an account on [Render.com](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. **Settings:**
* **Runtime:** Node
* **Build Command:** `npm install`
* **Start Command:** `node server.js`


5. **Environment Variables:** (Add these in the Render dashboard under "Environment")
* Key: `GROQ_API_KEY` | Value: `your_key`
* Key: `GNEWS_API_KEY` | Value: `your_key`


6. Click **Deploy Web Service**.

Your site is now live! 🚀

---

## 🤝 Contributing

Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).

---

**Developed by Piyush Maurya**
