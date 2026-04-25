
/* ─── State ─── */
let unit = 'C';
let city = { name: 'London', country: 'United Kingdom', latitude: 51.5085, longitude: -0.1257 };
let searchTimer = null;
let abortCtrl = null;
let particleAnim = null;
let lightningTimer = 0, lightningFlash = 0;

/* ─── Weather info: emoji + desc + animation class + bg theme ─── */
function weatherInfo(code, isDay = true) {
    if (code === 0) return { emoji: isDay ? '☀️' : '🌙', desc: isDay ? 'Clear sky' : 'Clear night', anim: 'wi-' + (isDay ? 'sun' : 'moon'), bg: 'wt-clear-' + (isDay ? 'day' : 'night') };
    if (code === 1) return { emoji: '🌤️', desc: 'Mainly clear', anim: 'wi-cloud', bg: isDay ? 'wt-partly' : 'wt-cloudy' };
    if (code === 2) return { emoji: '⛅', desc: 'Partly cloudy', anim: 'wi-cloud', bg: 'wt-partly' };
    if (code === 3) return { emoji: '☁️', desc: 'Overcast', anim: 'wi-cloud', bg: 'wt-cloudy' };
    if (code === 45 || code === 48) return { emoji: '🌫️', desc: 'Foggy', anim: 'wi-fog', bg: 'wt-fog' };
    if (code >= 51 && code <= 57) return { emoji: '🌦️', desc: 'Drizzle', anim: 'wi-rain', bg: 'wt-rain' };
    if (code >= 61 && code <= 67) return { emoji: '🌧️', desc: 'Rain', anim: 'wi-rain', bg: 'wt-rain' };
    if (code >= 71 && code <= 77) return { emoji: '❄️', desc: 'Snow', anim: 'wi-snow', bg: 'wt-snow' };
    if (code >= 80 && code <= 82) return { emoji: '🌧️', desc: 'Rain showers', anim: 'wi-rain', bg: 'wt-rain' };
    if (code === 85 || code === 86) return { emoji: '🌨️', desc: 'Snow showers', anim: 'wi-snow', bg: 'wt-snow' };
    if (code >= 95) return { emoji: '⛈️', desc: 'Thunderstorm', anim: 'wi-thunder', bg: 'wt-thunder' };
    return { emoji: '🌡️', desc: 'Unknown', anim: 'wi-cloud', bg: 'wt-cloudy' };
}

/* particle type per bg theme */
const PARTICLE_MAP = {
    'wt-rain': 'rain', 'wt-snow': 'snow', 'wt-thunder': 'thunder',
    'wt-fog': 'fog', 'wt-clear-day': 'stars', 'wt-clear-night': 'stars',
    'wt-partly': 'none', 'wt-cloudy': 'none'
};

/* ─── Background theme switcher ─── */
const weatherOverlay = document.getElementById('weather-overlay');
const ALL_WT = ['wt-clear-day', 'wt-clear-night', 'wt-partly', 'wt-cloudy', 'wt-fog', 'wt-rain', 'wt-snow', 'wt-thunder'];

function setWeatherTheme(bg) {
    /* Fade out overlay */
    weatherOverlay.classList.remove('loaded');
    /* Remove old body theme */
    document.body.classList.remove(...ALL_WT);
    /* Small delay so the CSS transition fires */
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.classList.add(bg);
            weatherOverlay.classList.add('loaded');
        });
    });
    /* Start particles */
    const pType = PARTICLE_MAP[bg] || 'none';
    startParticles(pType);
}

/* ─── Particle System ─── */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function startParticles(type) {
    if (particleAnim) { cancelAnimationFrame(particleAnim); particleAnim = null; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = [];
    lightningTimer = 0; lightningFlash = 0;

    if (type === 'rain') {
        for (let i = 0; i < 90; i++) particles.push(makeRainDrop());
        animateRain();
    } else if (type === 'snow') {
        for (let i = 0; i < 65; i++) particles.push(makeSnowFlake());
        animateSnow();
    } else if (type === 'thunder') {
        for (let i = 0; i < 100; i++) particles.push(makeRainDrop(true));
        animateThunder();
    } else if (type === 'fog') {
        for (let i = 0; i < 12; i++) particles.push(makeFogBlob());
        animateFog();
    } else if (type === 'stars') {
        for (let i = 0; i < 80; i++) particles.push(makeStar());
        animateStars();
    }
}

/* Rain drop factory */
function makeRainDrop(heavy = false) {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        speed: heavy ? (10 + Math.random() * 8) : (7 + Math.random() * 5),
        length: heavy ? (18 + Math.random() * 12) : (13 + Math.random() * 10),
        opacity: 0.25 + Math.random() * 0.30
    };
}
function makeSnowFlake() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 1.5 + Math.random() * 2.5,
        speed: 0.4 + Math.random() * 1.2,
        drift: (Math.random() - 0.5) * 0.3,
        angle: Math.random() * Math.PI * 2,
        opacity: 0.35 + Math.random() * 0.40
    };
}
function makeFogBlob() {
    return {
        x: Math.random() * canvas.width,
        y: (0.1 + Math.random() * 0.7) * canvas.height,
        rx: 120 + Math.random() * 200,
        ry: 40 + Math.random() * 60,
        speed: 0.06 + Math.random() * 0.10,
        phase: Math.random() * Math.PI * 2,
        baseOpacity: 0.025 + Math.random() * 0.035
    };
}
function makeStar() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.7,
        r: 0.5 + Math.random() * 1.2,
        opacity: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.004
    };
}

/* Animate: Rain */
function animateRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 0.8, p.y + p.length);
        ctx.strokeStyle = `rgba(147,197,253,${p.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        p.y += p.speed;
        p.x -= 0.4;
        if (p.y - p.length > canvas.height || p.x < -20) {
            Object.assign(p, makeRainDrop());
            p.y = -p.length;
            p.x = Math.random() * canvas.width;
        }
    });
    particleAnim = requestAnimationFrame(animateRain);
}

/* Animate: Snow */
function animateSnow() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.angle += 0.008;
        p.x += Math.sin(p.angle) * 0.4 + p.drift;
        p.y += p.speed;
        if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width; }
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.x < -10) p.x = canvas.width + 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(219,234,254,${p.opacity})`;
        ctx.fill();
    });
    particleAnim = requestAnimationFrame(animateSnow);
}

/* Animate: Thunder (heavy rain + lightning flash) */
function animateThunder() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Lightning flash overlay */
    lightningTimer++;
    const nextFlash = 160 + Math.floor(Math.random() * 280);
    if (lightningTimer > nextFlash) {
        lightningFlash = 6 + Math.floor(Math.random() * 6);
        lightningTimer = 0;
    }
    if (lightningFlash > 0) {
        const alpha = lightningFlash % 2 === 0 ? 0.07 : 0;
        ctx.fillStyle = `rgba(210,190,255,${alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        lightningFlash--;
    }

    /* Heavy rain */
    particles.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 1.2, p.y + p.length);
        ctx.strokeStyle = `rgba(147,197,253,${p.opacity * 0.65})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        p.y += p.speed;
        p.x -= 0.9;
        if (p.y - p.length > canvas.height || p.x < -20) {
            Object.assign(p, makeRainDrop(true));
            p.y = -p.length;
            p.x = Math.random() * canvas.width;
        }
    });
    particleAnim = requestAnimationFrame(animateThunder);
}

/* Animate: Fog */
function animateFog() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = Date.now() * 0.0002;
    particles.forEach(p => {
        const alpha = p.baseOpacity * (0.5 + 0.5 * Math.sin(t + p.phase));
        const cx = p.x + Math.sin(t * p.speed * 4 + p.phase) * 60;
        const cy = p.y + Math.cos(t * p.speed * 2 + p.phase) * 15;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, p.rx);
        grad.addColorStop(0, `rgba(148,163,184,${alpha})`);
        grad.addColorStop(1, 'rgba(148,163,184,0)');
        ctx.save();
        ctx.scale(1, p.ry / p.rx);
        ctx.beginPath();
        ctx.ellipse(cx, cy * (p.rx / p.ry), p.rx, p.rx, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    });
    particleAnim = requestAnimationFrame(animateFog);
}

/* Animate: Stars (clear sky) */
function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = Date.now() * 0.001;
    particles.forEach(p => {
        const alpha = p.opacity * (0.5 + 0.5 * Math.sin(t * p.speed * 200 + p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
    });
    particleAnim = requestAnimationFrame(animateStars);
}

/* ─── Date helpers ─── */
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatDateLong(dateStr) {
    const d = new Date(dateStr);
    const day = DAY_NAMES[d.getDay()];
    const month = MONTH_NAMES[d.getMonth()];
    const date = d.getDate();
    const suffix = ['th', 'st', 'nd', 'rd'][(date % 10 < 4 && (date < 11 || date > 13)) ? date % 10 : 0] || 'th';
    const h = d.getHours(), m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM', h12 = h % 12 || 12;
    return `${day}, ${month} ${date}${suffix} • ${h12}:${m} ${ampm}`;
}
function isToday(dateStr) {
    const d = new Date(dateStr), now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}
function formatHour(dateStr) {
    const h = new Date(dateStr).getHours();
    return h === 0 ? '12AM' : h < 12 ? `${h}AM` : h === 12 ? '12PM' : `${h - 12}PM`;
}
function formatDayName(dateStr) { return DAY_NAMES[new Date(dateStr).getDay()]; }

/* ─── DOM refs ─── */
const $ = id => document.getElementById(id);
const loadingEl = $('loading-state');
const errorEl = $('error-state');
const errorMsgEl = $('error-msg');
const mainEl = $('main-content');
const searchInput = $('search-input');
const searchClear = $('search-clear');
const dropdown = $('search-dropdown');
const dropdownMsg = $('dropdown-msg');
const resultsList = $('results-list');
const searchGlass = $('search-glass');
const searchSpinner = $('search-spinner');
const toggleTrack = $('toggle-track');
const btnC = $('btn-c');
const btnF = $('btn-f');

/* ─── Unit toggle ─── */
function setUnit(u) {
    unit = u;
    if (u === 'C') { toggleTrack.classList.remove('f'); btnC.classList.add('active'); btnF.classList.remove('active'); }
    else { toggleTrack.classList.add('f'); btnF.classList.add('active'); btnC.classList.remove('active'); }
    fetchWeather();
}
btnC.addEventListener('click', () => setUnit('C'));
btnF.addEventListener('click', () => setUnit('F'));

/* ─── Search ─── */
searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    searchClear.style.display = q ? 'flex' : 'none';
    clearTimeout(searchTimer);
    if (q.length < 2) { closeDropdown(); return; }
    searchTimer = setTimeout(() => geocode(q), 420);
});
searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length >= 2) openDropdown();
});
searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    closeDropdown(); searchInput.focus();
});
document.addEventListener('mousedown', e => {
    if (!searchInput.closest('.search-wrap').contains(e.target)) closeDropdown();
});
function openDropdown() { dropdown.classList.add('open'); }
function closeDropdown() { dropdown.classList.remove('open'); }
function setSearchLoading(on) {
    searchGlass.style.display = on ? 'none' : 'block';
    searchSpinner.style.display = on ? 'block' : 'none';
}

async function geocode(q) {
    setSearchLoading(true);
    dropdownMsg.textContent = 'Searching…';
    dropdownMsg.style.display = 'block';
    resultsList.innerHTML = '';
    openDropdown();
    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`);
        const data = await res.json();
        // printing in console
        console.log(data)
        const results = data.results || [];
        if (results.length === 0) {
            dropdownMsg.textContent = `No cities found for "${q}"`;
        } else {
            dropdownMsg.style.display = 'none';
            results.forEach(loc => {
                const li = document.createElement('li');
                const btn = document.createElement('button');
                btn.className = 'result-btn';
                btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <div>
              <div class="result-name">${loc.name}</div>
              <div class="result-sub">${[loc.admin1, loc.country].filter(Boolean).join(', ')}</div>
            </div>`;
                btn.addEventListener('click', () => {
                    city = { name: loc.name, country: loc.country, latitude: loc.latitude, longitude: loc.longitude };
                    searchInput.value = '';
                    searchClear.style.display = 'none';
                    closeDropdown();
                    fetchWeather();
                });
                li.appendChild(btn);
                resultsList.appendChild(li);
            });
        }
    } catch { dropdownMsg.textContent = 'Failed to load results.'; }
    finally { setSearchLoading(false); }
}

/* ─── Weather fetch ─── */
async function fetchWeather() {
    showLoading();
    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();
    const tempUnit = unit === 'F' ? '&temperature_unit=fahrenheit' : '';
    const url = `https://api.open-meteo.com/v1/forecast`
        + `?latitude=${city.latitude}&longitude=${city.longitude}`
        + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m`
        + `&hourly=temperature_2m,weather_code`
        + `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`
        + `&timezone=auto&forecast_days=7${tempUnit}`;
    try {
        const res = await fetch(url, { signal: abortCtrl.signal });
        if (!res.ok) throw new Error('Failed to fetch weather data.');
        renderWeather(await res.json());
    } catch (err) {
        if (err.name !== 'AbortError') showError(err.message || 'Could not load weather data.');
    }
}

/* Helper: apply animation class to a span */
function animSpan(emoji, animClass) {
    return `<span class="${animClass}" style="display:inline-block">${emoji}</span>`;
}

/* ─── Render ─── */
function renderWeather(data) {
    const cur = data.current;
    const isDay = cur.is_day === 1;
    const cond = weatherInfo(cur.weather_code, isDay);

    /* ── Background theme (animates once on load) ── */
    setWeatherTheme(cond.bg);

    /* ── Current card ── */
    $('city-name').textContent = city.name;
    $('current-time').textContent = formatDateLong(cur.time);
    $('current-temp').textContent = `${Math.round(cur.temperature_2m)}°`;
    $('condition-icon').className = cond.anim;
    $('condition-icon').textContent = cond.emoji;
    $('condition-text').textContent = cond.desc;
    $('feels-val').textContent = `${Math.round(cur.apparent_temperature)}°`;
    $('wind-speed').textContent = cur.wind_speed_10m;
    $('humidity').textContent = cur.relative_humidity_2m;

    /* ── Hourly (next 24 h from current hour) ── */
    const nowHour = new Date().getHours();
    const todayStr = new Date().toISOString().slice(0, 10);
    let startIdx = data.hourly.time.findIndex(t => t.startsWith(todayStr) && new Date(t).getHours() === nowHour);
    if (startIdx === -1) startIdx = 0;
    const next24 = data.hourly.time.slice(startIdx, startIdx + 24);

    $('hourly-list').innerHTML = next24.map((t, i) => {
        const h = new Date(t).getHours();
        const info = weatherInfo(data.hourly.weather_code[startIdx + i], h >= 6 && h < 19);
        const temp = Math.round(data.hourly.temperature_2m[startIdx + i]);
        const isNow = i === 0;
        return `<div class="hour-card${isNow ? ' now' : ''}">
        <span class="hour-time">${isNow ? 'Now' : formatHour(t)}</span>
        <span class="hour-emoji ${info.anim}">${info.emoji}</span>
        <span class="hour-temp">${temp}°</span>
      </div>`;
    }).join('');

    /* ── Daily ── */
    $('daily-list').innerHTML = data.daily.time.map((t, i) => {
        const info = weatherInfo(data.daily.weather_code[i], true);
        const today = isToday(t);
        const precip = data.daily.precipitation_probability_max[i];
        const precipBadge = precip > 20
            ? `<span class="precip-badge">🌧 ${precip}%</span>` : '';
        return `<div class="day-row${today ? ' today' : ''}">
        <div class="day-name">${today ? 'Today' : formatDayName(t)}</div>
        <div class="day-mid">
          <span class="day-emoji ${info.anim}">${info.emoji}</span>
          ${precipBadge}
        </div>
        <div class="day-temps">
          <span class="day-max">${Math.round(data.daily.temperature_2m_max[i])}°</span>
          <span class="day-min">${Math.round(data.daily.temperature_2m_min[i])}°</span>
        </div>
      </div>`;
    }).join('');

    showMain();
}

/* ─── UI state ─── */
function showLoading() {
    loadingEl.style.display = 'flex';
    errorEl.style.display = 'none';
    mainEl.classList.remove('visible');
}
function showMain() {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'none';
    mainEl.classList.add('visible');
}
function showError(msg) {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'flex';
    mainEl.classList.remove('visible');
    errorMsgEl.textContent = msg;
}

/* ─── Boot ─── */
fetchWeather();