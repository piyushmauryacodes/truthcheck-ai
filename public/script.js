// Theme
function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}

// Routing
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${viewName}`).classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-blue-600', 'font-bold');
        btn.classList.add('text-gray-500');
    });
    document.getElementById(`btn-${viewName}`).classList.add('text-blue-600', 'font-bold');

    // Load data for the specific view
    loadNews(viewName);
}

// News Loader
async function loadNews(type) {
    // Determine which grid to fill
    let gridId;
    if (type === 'home') gridId = 'home-news-grid';
    else if (type === 'world') gridId = 'world-news-grid';
    else gridId = 'india-news-grid';

    const container = document.getElementById(gridId);
    if (!container) return; // Safety check
    
    // Prevent reloading if already has content (optional optimization)
    if (container.children.length > 0 && type !== 'home') return; 

    container.innerHTML = `<div class="col-span-full text-center animate-pulse">Loading updates...</div>`;

    try {
        const res = await fetch(`/api/news?type=${type}`);
        const articles = await res.json();
        
        container.innerHTML = ''; // Clear loader

        if(articles.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center text-red-500">No news found. Check API limit.</div>`;
            return;
        }

        articles.forEach(article => {
            if (!article.title || !article.urlToImage) return;

            const card = document.createElement('div');
            card.className = "bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col";
            card.innerHTML = `
                <img src="${article.urlToImage}" class="w-full h-48 object-cover">
                <div class="p-4 flex flex-col flex-1">
                    <div class="text-xs text-blue-600 font-bold uppercase mb-2">${article.source.name}</div>
                    <h3 class="font-bold text-md mb-2 leading-tight dark:text-gray-200">${article.title}</h3>
                    <div class="mt-auto pt-4 flex gap-2">
                        <button onclick="checkThisNews('${article.title.replace(/'/g, "\\'")}')" class="flex-1 bg-gray-100 dark:bg-gray-700 py-2 rounded text-xs font-bold">Verify</button>
                        <a href="${article.url}" target="_blank" class="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded text-xs font-bold">Read</a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (e) {
        console.error(e);
        container.innerHTML = `<div class="col-span-full text-center text-red-500">Error loading news.</div>`;
    }
}

// Helpers
function checkThisNews(headline) {
    if(document.getElementById('view-home').classList.contains('hidden')) {
        switchView('home');
    }
    document.getElementById('newsInput').value = headline;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    checkNews();
}

function showHomeInput() {
    document.getElementById('result-section').classList.add('hidden');
    document.getElementById('home-feed-section').classList.remove('hidden'); // Show feed again
    document.getElementById('newsInput').value = '';
}

// AI Check Logic (Same as before)
async function checkNews() {
    const input = document.getElementById('newsInput').value;
    const btnText = document.getElementById('btnText');
    const btn = document.querySelector('button[onclick="checkNews()"]');

    if(!input) return alert("Enter headline!");
    
    btnText.innerText = "Checking...";
    btn.disabled = true;

    try {
        const res = await fetch('/api/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: input })
        });
        const data = await res.json();
        
        // Hide Feed, Show Result
        document.getElementById('home-feed-section').classList.add('hidden');
        document.getElementById('result-section').classList.remove('hidden');
        
        // Populate
        document.getElementById('searched-query').textContent = input;
        document.getElementById('confidence-score').textContent = data.confidence;
        document.getElementById('ai-explanation').textContent = data.explanation;
        document.getElementById('fact-check').textContent = data.fact_check;

        // Styling
        const status = document.getElementById('result-status');
        const card = document.getElementById('result-card');
        const bar = document.getElementById('status-bar');

        if(data.status === "FAKE") {
            status.innerText = "⚠️ FAKE NEWS";
            status.className = "text-4xl font-black text-center mb-2 text-red-600";
            card.classList.add('border-red-500');
            bar.className = "absolute top-0 left-0 w-full h-2 bg-red-600";
        } else {
            status.innerText = "✅ REAL NEWS";
            status.className = "text-4xl font-black text-center mb-2 text-green-600";
            card.classList.add('border-green-500');
            bar.className = "absolute top-0 left-0 w-full h-2 bg-green-600";
        }

    } catch(e) { alert("Error."); }
    finally {
        btnText.innerText = "ANALYZE";
        btn.disabled = false;
    }
}

// Download
function downloadResult() {
    html2canvas(document.getElementById('result-card')).then(c => {
        const a = document.createElement('a');
        a.download = 'Result.png';
        a.href = c.toDataURL();
        a.click();
    });
}

// Init
loadNews('home');