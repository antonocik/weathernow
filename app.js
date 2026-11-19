const BASE = "https://api.open-meteo.com/v1/forecast";
const paramsDefault = {
  latitude: -6.200000,   // Jakarta center
  longitude: 106.816666,
  current_weather: true,
  hourly: "temperature_2m,weathercode",
  daily: "temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max",
  timezone: "auto"
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const weatherCodes = {
  0: "Cerah", 1: "Cerah sebagian", 2: "Tidak berawan", 3: "Berasap",
  45: "Kabut", 48: "Kabut deposito", 51: "Hujan ringan", 53: "Hujan sedang", 56: "Hujan es",
  61: "Hujan kuat", 63: "Hujan es kuat", 65: "Hujan es sangat kuat", 71: "Bersalju",
  73: "Bersalju lembut", 75: "Bersalju berat", 77: "Bersalju penggilingan", 80: "Hujan isolated",
  81: "Hujan lebat", 82: "Hujan es menggapai", 95: "Badai es", 96: "Badai es dengan hail 2mm",
  99: "Badai es dengan hail besar"
};

function renderCurrent(data) {
  const c = data.current_weather;
  $("#curTemp").textContent = `${Math.round(c.temperature)}°C`;
  $("#curWind").textContent = `${c.windspeed} km/h`;
  $("#curCode").textContent = weatherCodes[c.weathercode] || "-";
  $("#curIcon").src = `/assets/img/weather/${c.weathercode}.svg`;
}

function renderDaily(data) {
  const d = data.daily;
  const container = $("#forecastContainer");
  container.innerHTML = "";
  for (let i = 0; i < d.time.length && i < 7; i++) {
    const day = new Date(d.time[i]).toLocaleDateString("id-ID", { weekday: "short", month: "short", day: "numeric" });
    const max = Math.round(d.temperature_2m_max[i]);
    const min = Math.round(d.temperature_2m_min[i]);
    const desc = weatherCodes[d.weathercode[i]] || "-";
    container.innerHTML += `
      <div class="forecast-day">
        <div class="forecast-day__day">${day}</div>
        <div class="forecast-day__temp">${max}°C / ${min}°C</div>
        <div class="forecast-day__desc">${desc}</div>
      </div>
    `;
  }
}

async function loadWeather(city = "Jakarta") {
  const err = $("#error");
  err.classList.remove("show");
  $("#loading").classList.add("show");
  try {
    const latlon = {
      "Jakarta": [-6.2, 106.8],
      "Bandung": [-6.9167, 107.6167],
      "Surabaya": [-7.2575, 112.7521],
      "Yogyakarta": [-7.7869, 110.3882],
      "Semarang": [-6.9667, 110.4167]
    }[city];
    if (!latlon) throw new Error("Kota tidak didukung");

    const url = new URL(BASE);
    url.searchParams.set("latitude", latlon[0]);
    url.searchParams.set("longitude", latlon[1]);
    url.searchParams.set("current_weather", paramsDefault.current_weather);
    url.searchParams.set("hourly", paramsDefault.hourly);
    url.searchParams.set("daily", paramsDefault.daily);
    url.searchParams.set("timezone", paramsDefault.timezone);

    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Gagal ambil data");
    const data = await resp.json();
    renderCurrent(data);
    renderDaily(data);
    $("#error").classList.add("show"); // reused for success visual, but we hide it
  } catch (e) {
    err.classList.add("show");
    $("#loading").classList.remove("show");
    console.error(e);
  } finally {
    $("#loading").classList.remove("show");
  }
}

// Events
$("#searchForm").addEventListener("submit", e => {
  e.preventDefault();
  const city = $("#cityInput").value.trim() || "Jakarta";
  loadWeather(city);
});

// Init
loadWeather();