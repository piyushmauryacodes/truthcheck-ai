// Theme & Time Init
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);
    
    // Set initial theme icon
    const isDark = document.documentElement.classList.contains('dark');
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.innerText = isDark ? '☀️' : '🌙';
});

function updateTime() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };
    const timeStr = now.toLocaleDateString('en-US', options);
    const timeEl = document.getElementById('current-time');
    if (timeEl) timeEl.textContent = timeStr;
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.innerText = isDark ? '☀️' : '🌙';
}

// Routing
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${viewName}`).classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-blue-600', 'font-bold', 'border-b-2', 'border-blue-600');
        btn.classList.add('text-gray-500');
    });
    
    const activeBtn = document.getElementById(`btn-${viewName}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-gray-500');
        activeBtn.classList.add('text-blue-600', 'font-bold');
    }

    // Load data for the specific view
    loadNews(viewName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// News Loader
async function loadNews(type) {
    let gridId;
    if (type === 'home') gridId = 'home-news-grid';
    else if (type === 'world') gridId = 'world-news-grid';
    else if (type === 'india') gridId = 'india-news-grid';
    else return;

    const container = document.getElementById(gridId);
    if (!container) return;
    
    if (container.children.length > 0 && type !== 'home') return; 

    container.innerHTML = `<div class="col-span-full text-center py-20"><div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div><p class="mt-4 text-gray-500 font-bold">Fetching latest updates...</p></div>`;

    try {
        const res = await fetch(`/api/news?type=${type}`);
        const articles = await res.json();
        
        container.innerHTML = ''; 

        if(articles.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-20 text-red-500 font-bold">No news found. Check API limit.</div>`;
            return;
        }

        articles.forEach(article => {
            if (!article.title || !article.urlToImage) return;

            const card = document.createElement('div');
            card.className = "bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col group";
            card.innerHTML = `
                <div class="relative overflow-hidden h-48">
                    <img src="${article.urlToImage}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                    <div class="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-blue-600 shadow-sm">
                        ${article.source.name}
                    </div>
                </div>
                <div class="p-6 flex flex-col flex-1">
                    <h3 class="font-bold text-lg mb-4 leading-tight dark:text-gray-200 line-clamp-3">${article.title}</h3>
                    <div class="mt-auto pt-4 flex gap-3">
                        <button onclick="checkThisNews('${article.title.replace(/'/g, "\\'")}')" class="flex-1 bg-blue-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Verify Now</button>
                        <a href="${article.url}" target="_blank" class="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Read</a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (e) {
        console.error(e);
        container.innerHTML = `<div class="col-span-full text-center py-20 text-red-500 font-bold">Error loading news.</div>`;
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

function closeModal() {
    document.getElementById('result-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showModal() {
    document.getElementById('result-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// AI Check Logic
async function checkNews() {
    const input = document.getElementById('newsInput').value;
    const btnText = document.getElementById('btnText');
    const btn = document.querySelector('button[onclick="checkNews()"]');

    if(!input) return alert("Please enter a headline or claim to analyze!");
    
    btnText.innerText = "Analyzing...";
    btn.disabled = true;

    try {
        const res = await fetch('/api/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: input })
        });
        const data = await res.json();
        
        displayGenericResult(data, "News Headline Analysis", input, 'blue');
    } catch(e) { 
        alert("Server error. Please try again."); 
    } finally {
        btnText.innerText = "ANALYZE";
        btn.disabled = false;
    }
}

// --- VISUAL CHECKER ---
async function checkVisual() {
    const fileInput = document.getElementById('visualInput');
    const file = fileInput.files[0];
    const btn = document.getElementById('btn-visual');

    if (!file) return alert("Please upload an image or video first!");

    const isVideo = file.type.startsWith('video/');
    if (isVideo && file.size > 5 * 1024 * 1024) {
        return alert("Video is too large! Please keep it under 5MB.");
    } else if (!isVideo && file.size > 2 * 1024 * 1024) {
        return alert("Image is too large! Please keep it under 2MB.");
    }

    const formData = new FormData();
    formData.append('media', file);

    const originalText = btn.innerText;
    btn.innerText = "Scanning Pixels...";
    btn.disabled = true;

    try {
        const res = await fetch('/api/detect-visual', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        displayGenericResult(data, "Deepfake Detection Result", file.name, 'purple');
    } catch (e) {
        alert("Error analyzing media.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
        fileInput.value = "";
    }
}

// --- JOB CHECKER ---
async function checkJob() {
    const textInput = document.getElementById('jobTextInput').value;
    const fileInput = document.getElementById('jobImageInput');
    const file = fileInput.files[0];
    const btn = document.getElementById('btn-job');

    if (!textInput && !file) return alert("Please paste job details or upload a screenshot.");

    const formData = new FormData();
    if (textInput) formData.append('text', textInput);
    if (file) formData.append('media', file);

    const originalText = btn.innerText;
    btn.innerText = "Checking Credibility...";
    btn.disabled = true;

    try {
        const res = await fetch('/api/detect-job', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        const contextTitle = file ? "Job Post Screenshot Analysis" : "Job Message Analysis";
        displayGenericResult(data, contextTitle, textInput || file.name, 'green');
    } catch (e) {
        alert("Error analyzing job posting.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
        document.getElementById('jobTextInput').value = "";
        fileInput.value = "";
    }
}

// --- REUSABLE RESULT DISPLAY ---
function displayGenericResult(data, contextHeader, contextText, themeColorStr) {
    showModal();
    
    document.getElementById('searched-query').textContent = contextText || "Provided Input";
    document.getElementById('confidence-score').textContent = data.confidence || "N/A";
    document.getElementById('ai-explanation').textContent = data.explanation || "No explanation provided.";
    
    const factCheckContainer = document.getElementById('fact-check-container');
    if (data.fact_check) {
        factCheckContainer.classList.remove('hidden');
        document.getElementById('fact-check').textContent = data.fact_check;
    } else {
        factCheckContainer.classList.add('hidden');
    }

    const status = document.getElementById('result-status');
    const bar = document.getElementById('status-bar');

    if (data.status === "ERROR") {
        status.innerText = "❌ ERROR";
        status.className = "text-4xl font-black text-center mb-2 text-red-600 uppercase";
        bar.className = "h-2 w-full bg-red-600";
    } else if (data.status === "FAKE") {
        status.innerText = "⚠️ FAKE / SCAM";
        status.className = "text-4xl font-black text-center mb-2 text-red-600 uppercase";
        bar.className = "h-2 w-full bg-red-600";
    } else {
        status.innerText = "✅ AUTHENTIC";
        status.className = "text-4xl font-black text-center mb-2 text-green-600 uppercase";
        bar.className = "h-2 w-full bg-green-600";
    }
}

// PDF Download
async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const status = document.getElementById('result-status').innerText;
    const confidence = document.getElementById('confidence-score').innerText;
    const query = document.getElementById('searched-query').textContent;
    const explanation = document.getElementById('ai-explanation').textContent;
    const factCheckEl = document.getElementById('fact-check');
    const factCheck = factCheckEl ? factCheckEl.textContent : "";

    // Design the PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text("TruthCheck AI - Verification Report", 20, 25);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 30, 190, 30);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`VERDICT: ${status}`, 20, 45);
    doc.text(`CONFIDENCE: ${confidence}`, 20, 55);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("ANALYZED INPUT:", 20, 70);
    doc.setFont("helvetica", "italic");
    const splitQuery = doc.splitTextToSize(query, 160);
    doc.text(splitQuery, 20, 77);

    let y = 85 + (splitQuery.length * 5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("AI EXPLANATION:", 20, y);
    doc.setFont("helvetica", "normal");
    const splitExp = doc.splitTextToSize(explanation, 160);
    doc.text(splitExp, 20, y + 7);

    y += 15 + (splitExp.length * 5);
    const factCheckContainer = document.getElementById('fact-check-container');
    if (factCheck && factCheckContainer && !factCheckContainer.classList.contains('hidden')) {
        doc.setFont("helvetica", "bold");
        doc.text("FACT CHECK CONTEXT:", 20, y);
        doc.setFont("helvetica", "normal");
        const splitFact = doc.splitTextToSize(factCheck, 160);
        doc.text(splitFact, 20, y + 7);
        y += 10 + (splitFact.length * 5);
    }

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Report Generated on: ${new Date().toLocaleString()}`, 20, 280);
    doc.text("TruthCheck.AI | Designed by PIYUSH MAURYA with AI", 20, 285);

    doc.save(`TruthCheck_Report_${Date.now()}.pdf`);
}

// Init
loadNews('home');