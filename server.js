require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Groq = require("groq-sdk");

const app = express();
const PORT = 3000;

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- NEW: GNews API Helper ---
async function fetchGNews(query, country) {
    try {
        // GNews uses 'in', 'us', 'gb', etc.
        const url = `https://gnews.io/api/v4/top-headlines?category=general&lang=en&country=${country}&max=10&apikey=${process.env.GNEWS_API_KEY}`;
        const response = await axios.get(url);
        return response.data.articles || [];
    } catch (error) {
        console.error(`GNews Error (${country}):`, error.message);
        return [];
    }
}

// --- ROUTE 1: Smart News Handler ---
app.get('/api/news', async (req, res) => {
    const type = req.query.type || 'home'; // 'home', 'world', 'india'

    let articles = [];

    if (type === 'india') {
        // Fetch only India news
        articles = await fetchGNews('general', 'in');
    } 
    else if (type === 'world') {
        // Fetch US/UK news as proxy for world
        articles = await fetchGNews('general', 'us');
    } 
    else {
        // === MIXED HOME PAGE (5 India + 5 World) ===
        const [indiaNews, worldNews] = await Promise.all([
            fetchGNews('general', 'in'),
            fetchGNews('general', 'us')
        ]);
        
        // Interleave them: 1 India, 1 World, 1 India...
        const maxLength = Math.max(indiaNews.length, worldNews.length);
        for (let i = 0; i < maxLength; i++) {
            if (indiaNews[i]) articles.push(indiaNews[i]);
            if (worldNews[i]) articles.push(worldNews[i]);
        }
    }

    // Standardize data format (GNews structure is slightly diff from NewsAPI)
    const formattedArticles = articles.slice(0, 12).map(art => ({
        title: art.title,
        description: art.description,
        url: art.url,
        urlToImage: art.image, // GNews uses 'image', not 'urlToImage'
        source: { name: art.source.name },
        publishedAt: art.publishedAt
    }));

    res.json(formattedArticles);
});

// --- ROUTE 2: AI Detection (Unchanged) ---
app.post('/api/detect', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text" });

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Analyze this news headline. Return JSON:
                    { "status": "FAKE"|"REAL"|"SATIRE", "confidence": "99%", "explanation": "reason", "fact_check": "context" }`
                },
                { role: "user", content: text }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0,
            response_format: { type: "json_object" }
        });
        const result = JSON.parse(completion.choices[0].message.content);
        res.json(result);
    } catch (error) {
        res.status(500).json({ status: "ERROR", explanation: "AI unavailable" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});