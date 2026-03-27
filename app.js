document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('messageInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultsSection = document.getElementById('resultsSection');
    const statusText = document.getElementById('backendStatus');
    const statusPulse = document.querySelector('.pulse');
    
    // UI Elements
    const meterFill = document.getElementById('meterFill');
    const confidenceValue = document.getElementById('confidenceValue');
    const threatLevel = document.getElementById('threatLevel');
    const classificationType = document.getElementById('classificationType');
    const riskLevel = document.getElementById('riskLevel');
    const engineUsed = document.getElementById('engineUsed');
    const detectedTriggers = document.getElementById('detectedTriggers');
    const previewBox = document.getElementById('messagePreview');

    // Init local fallback
    const localDetector = new window.ScamDetector();
    let backendAvailable = false;

    // Check backend connection by pinging
    checkBackend();

    async function checkBackend() {
        try {
            const res = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({text: "ping"})
            });
            if (res.ok) {
                backendAvailable = true;
                statusText.innerText = "Python ML Engine Active";
                statusPulse.className = "pulse connected";
            } else {
                useFallbackStatus();
            }
        } catch (e) {
            useFallbackStatus();
        }
    }

    function useFallbackStatus() {
        backendAvailable = false;
        statusText.innerText = "Local Hybrid Processing";
        statusPulse.className = "pulse disconnected";
    }

    analyzeBtn.addEventListener('click', async () => {
        const text = input.value.trim();
        if (!text) {
            alert('Please input email content to scan.');
            return;
        }

        analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Scanning Base...';
        analyzeBtn.disabled = true;

        let result;
        const localRes = localDetector.analyze(text);

        if (backendAvailable) {
            try {
                const res = await fetch('http://localhost:5000/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({text: text})
                });
                result = await res.json();
                
                // Polyfill triggers/highlights from local NLP module to enrich Python backend result visually
                result.triggers = localRes.triggers;
                result.highlights = localRes.highlights;
                
            } catch (e) {
                useFallbackStatus();
                result = localRes;
            }
        } else {
            result = localRes;
        }

        setTimeout(() => {
            renderResults(result, text);
            analyzeBtn.innerHTML = '<i class="fa-solid fa-microchip"></i> Analyze Threat';
            analyzeBtn.disabled = false;
        }, 800); // UI delay for scanner feeling
    });

    resetBtn.addEventListener('click', () => {
        input.value = '';
        resultsSection.classList.add('hidden');
        meterFill.style.strokeDashoffset = 126;
        threatLevel.style.color = '#fff';
    });

    function renderResults(res, originalText) {
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Meter Arc length approx 126
        const maxOffset = 126;
        const confidence = Math.min(Math.max(res.confidence || 0, 0), 100);
        // mappedOffset 126 -> 0%, 0 -> 100%
        const mappedOffset = maxOffset - ((confidence / 100) * maxOffset);
        
        // Colors
        let color = '#10b981'; // Green
        let threatText = "NO THREAT DETECTED";
        
        if (confidence >= 75 || res.risk_label === "High" || res.risk_label === "Critical") {
            color = '#ef4444'; // Red
            threatText = "CRITICAL THREAT";
        } else if (confidence >= 40 || res.risk_label === "Medium") {
            color = '#f59e0b'; // Orange
            threatText = "SUSPICIOUS PATTERN";
        } else if (confidence >= 25) {
            color = '#3b82f6'; // Blue
            threatText = "LOW RISK";
        }

        // Animate Circle
        setTimeout(() => {
            meterFill.style.stroke = color;
            meterFill.style.strokeDashoffset = mappedOffset;
            
            // Count up 
            let current = 0;
            const step = Math.max(1, Math.ceil(confidence / 20));
            const timer = setInterval(() => {
                current += step;
                if (current >= confidence) {
                    current = confidence;
                    clearInterval(timer);
                }
                confidenceValue.innerText = Math.round(current) + '%';
                confidenceValue.style.color = color;
            }, 30);
            
        }, 100);

        threatLevel.innerText = threatText;
        threatLevel.style.color = color;

        classificationType.innerText = res.type;
        classificationType.style.color = color;
        riskLevel.innerText = res.risk_label;
        engineUsed.innerText = res.backend;

        // Populate Triggers
        detectedTriggers.innerHTML = '';
        if (res.triggers && res.triggers.length > 0) {
            res.triggers.forEach(t => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.innerHTML = `<i class="fa-solid fa-bolt"></i> ${t}`;
                detectedTriggers.appendChild(tag);
            });
        } else {
            detectedTriggers.innerHTML = '<span class="text-muted"><i class="fa-solid fa-shield"></i> Clean Interaction</span>';
        }

        // Highlight Keywords in Preview
        let highlightedHtml = escapeHtml(originalText);
        let usedHighlights = res.highlights || [];
        
        if (usedHighlights.length > 0) {
            // Sort by length so we match longest words first (greed vs greedy)
            usedHighlights.sort((a,b) => b.length - a.length);
            usedHighlights.forEach(word => {
                // simple regex approach
                const rgx = new RegExp(`\\b(${word})\\b`, 'gi');
                highlightedHtml = highlightedHtml.replace(rgx, '<span class="suspicious-word">$1</span>');
            });
        }
        previewBox.innerHTML = highlightedHtml;
    }

    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;");
    }
});
