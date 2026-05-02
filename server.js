require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Groq = require("groq-sdk");
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const NodeCache = require("node-cache"); // Added node-cache

const app = express();
const PORT = 3000;

// Initialize APIs
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create a cache that keeps data for 1800 seconds (30 minutes)
const newsCache = new NodeCache({ stdTTL: 1800 });

// Configure Multer for file uploads (Memory Storage so we can send buffer to Gemini)
// Limit set to 5MB to handle small 5-10 sec videos and images
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- UPDATED: GNews API Helper with Caching ---
async function fetchGNews(query, country) {
    const cacheKey = `news_${country}`; // e.g., 'news_in' or 'news_us'

    // 1. Check if we already have the news saved in the cache
    const cachedNews = newsCache.get(cacheKey);
    if (cachedNews) {
        console.log(`Serving ${country} news from cache!`);
        return cachedNews;
    }

    // 2. If not in cache, fetch from the actual API
    try {
        console.log(`Fetching fresh ${country} news from GNews API...`);
        const url = `https://gnews.io/api/v4/top-headlines?category=general&lang=en&country=${country}&max=10&apikey=${process.env.GNEWS_API_KEY}`;
        const response = await axios.get(url);

        const articles = response.data.articles || [];

        // 3. Save the fresh articles into the cache for next time
        if (articles.length > 0) {
            newsCache.set(cacheKey, articles);
        }

        return articles;
    } catch (error) {
        console.error(`GNews Error (${country}):`, error.message);

        // If we hit a 429 error, let the frontend know by returning an empty array
        // Your frontend script.js already handles empty arrays gracefully!
        return [];
    }
}

// --- ROUTE 1: News Feed ---
app.get('/api/news', async (req, res) => {
    const type = req.query.type || 'home';
    let articles = [];

    if (type === 'india') {
        articles = await fetchGNews('general', 'in');
    } else if (type === 'world') {
        articles = await fetchGNews('general', 'us');
    } else {
        const [indiaNews, worldNews] = await Promise.all([
            fetchGNews('general', 'in'),
            fetchGNews('general', 'us')
        ]);
        const maxLength = Math.max(indiaNews.length, worldNews.length);
        for (let i = 0; i < maxLength; i++) {
            if (indiaNews[i]) articles.push(indiaNews[i]);
            if (worldNews[i]) articles.push(worldNews[i]);
        }
    }

    const formattedArticles = articles.slice(0, 12).map(art => ({
        title: art.title,
        description: art.description,
        url: art.url,
        urlToImage: art.image,
        source: { name: art.source.name },
        publishedAt: art.publishedAt
    }));
    res.json(formattedArticles);
});

// --- ROUTE 2: Text News Detection (Gemini) ---
app.post('/api/detect', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Analyze this news headline. Return JSON strictly in this format: { "status": "FAKE"|"REAL", "confidence": "99%", "explanation": "reason", "fact_check": "context" }\n\nHeadline: ${text}`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();
        responseText = responseText.replace(/```json|```/g, '');

        res.json(JSON.parse(responseText));
    } catch (error) {
        console.error("GEMINI API ERROR (Text Detect):", error);
        res.status(500).json({ status: "ERROR", explanation: "AI unavailable" });
    }
});
// --- ROUTE 3: Visual Fake Detector (Gemini) ---
app.post('/api/detect-visual', upload.single('media'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Analyze this image/video. Is it likely AI-generated, a deepfake, or heavily manipulated? Look for artifacts, unnatural lighting, or inconsistencies. 
        Return JSON strictly in this format: { "status": "FAKE"|"REAL", "confidence": "90%", "explanation": "detailed reason", "more_info_url": "Search query URL like https://www.google.com/search?q=deepfake+detection" }`;

        const mediaPart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype
            }
        };

        const result = await model.generateContent([prompt, mediaPart]);
        const responseText = result.response.text().replace(/```json|```/g, ''); // Clean markdown
        res.json(JSON.parse(responseText));
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "ERROR", explanation: "AI analysis failed or file too large." });
    }
});

// --- ROUTE 4: Fake Job Detector (Gemini for Text and Media) ---
app.post('/api/detect-job', upload.single('media'), async (req, res) => {
    const textData = req.body.text;
    const fileData = req.file;

    if (!textData && !fileData) return res.status(400).json({ error: "Provide text/link or upload an image." });

    try {
        let resultJson;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        if (fileData) {
            // Use Gemini for Image based job posts (Screenshots)
            const prompt = `Analyze this image of a job/internship posting. Is it a scam? Look for unrealistic salaries, WhatsApp numbers, asking for money, or fake corporate branding.
            Return JSON strictly in this format: { "status": "FAKE"|"REAL", "confidence": "95%", "explanation": "reason", "more_info_url": "URL to verify company or report scam" }`;

            const mediaPart = {
                inlineData: { data: fileData.buffer.toString("base64"), mimeType: fileData.mimetype }
            };
            const result = await model.generateContent([prompt, mediaPart]);
            resultJson = result.response.text().replace(/```json|```/g, '');
        } else {
            // Use Gemini for Text/Link based job posts
            const prompt = `Analyze this job posting/message. Is it a scam? Look for high pay for easy work, upfront fees, or suspicious links. 
            Return JSON strictly in this format: { "status": "FAKE"|"REAL", "confidence": "95%", "explanation": "reason", "more_info_url": "URL for job scam awareness" }\n\nJob Posting: ${textData}`;

            const result = await model.generateContent(prompt);
            resultJson = result.response.text().replace(/```json|```/g, '');
        }

        res.json(JSON.parse(resultJson));
    } catch (error) {
        console.error("GEMINI API ERROR (Job Detect):", error);
        res.status(500).json({ status: "ERROR", explanation: "Job analysis failed." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});