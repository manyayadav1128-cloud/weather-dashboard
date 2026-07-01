/* =========================================================
   WEATHER DASHBOARD — SCRIPT
   Fetches live weather data from the OpenWeatherMap API
   and updates the page. Organized into clear sections with
   comments so it's easy to follow for beginners.
   ========================================================= */

/* -----------------------------------------------------------
   1. CONFIG
   Get your own free API key at https://openweathermap.org/api
   Sign up -> API keys tab -> copy the key -> paste it below.
   ----------------------------------------------------------- */
const API_KEY = "f47d7950c0e2ce991476391094a93595"; // <-- put your key here
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

/* -----------------------------------------------------------
   2. GRAB DOM ELEMENTS
   We store references once so we don't have to query the
   DOM repeatedly every time we update the page.
   ----------------------------------------------------------- */
const bgLayer      = document.getElementById("bg-layer");
const searchForm   = document.getElementById("search-form");
const cityInput    = document.getElementById("city-input");
const quickCities   = document.querySelectorAll(".chip");

const loader       = document.getElementById("loader");
const errorBox     = document.getElementById("error-box");
const errorText    = document.getElementById("error-text");
const weatherCard  = document.getElementById("weather-card");
const emptyState   = document.getElementById("empty-state");

const cityNameEl   = document.getElementById("city-name");
const dateTimeEl   = document.getElementById("date-time");
const weatherIconEl = document.getElementById("weather-icon");
const temperatureEl = document.getElementById("temperature");
const conditionEl  = document.getElementById("condition");
const feelsLikeEl  = document.getElementById("feels-like");
const humidityEl   = document.getElementById("humidity");
const windSpeedEl  = document.getElementById("wind-speed");
const pressureEl   = document.getElementById("pressure");

/* -----------------------------------------------------------
   3. EVENT LISTENERS
   ----------------------------------------------------------- */

// Search form submit (user types a city and hits Enter / clicks Search)
searchForm.addEventListener("submit", (e) => {
  e.preventDefault(); // stop the page from reloading
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  }
});

// Quick city chip buttons
quickCities.forEach((chip) => {
  chip.addEventListener("click", () => {
    const city = chip.getAttribute("data-city");
    cityInput.value = city;
    getWeather(city);
  });
});

/* -----------------------------------------------------------
   4. MAIN FUNCTION — FETCH WEATHER DATA
   ----------------------------------------------------------- */
async function getWeather(city) {
  // Guard: remind the developer to add their API key
  if (!API_KEY || API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {
    showError("Missing API key. Open script.js and add your OpenWeatherMap API key.");
    return;
  }

  showLoader();

  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);

    // OpenWeatherMap returns 404 for a city it can't find
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found. Please check the spelling and try again.");
      }
      throw new Error("Something went wrong while fetching weather data. Please try again.");
    }

    const data = await response.json();
    renderWeather(data);
  } catch (err) {
    showError(err.message);
  }
}

/* -----------------------------------------------------------
   5. RENDER WEATHER DATA ON THE PAGE
   ----------------------------------------------------------- */
function renderWeather(data) {
  // --- City name & date/time ---
  cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
  dateTimeEl.textContent = formatDateTime(data.dt, data.timezone);

  // --- Icon ---
  const iconCode = data.weather[0].icon;
  weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIconEl.alt = data.weather[0].description;

  // --- Temperature & condition ---
  temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
  conditionEl.textContent = data.weather[0].description;
  feelsLikeEl.textContent = `Feels like ${Math.round(data.main.feels_like)}°C`;

  // --- Stats ---
  humidityEl.textContent = `${data.main.humidity}%`;
  windSpeedEl.textContent = `${data.wind.speed} m/s`;
  pressureEl.textContent = `${data.main.pressure} hPa`;

  // --- Background gradient based on weather + day/night ---
  updateBackground(data.weather[0].main, iconCode);

  // --- Show the card, hide loader/error/empty state ---
  hideLoader();
  hideError();
  emptyState.classList.add("hidden");
  weatherCard.classList.remove("hidden");
}

/* -----------------------------------------------------------
   6. HELPERS
   ----------------------------------------------------------- */

// Formats the city's local date & time using the timezone
// offset (in seconds) that OpenWeatherMap gives us.
function formatDateTime(unixTimestamp, timezoneOffsetSeconds) {
  const localMs = (unixTimestamp + timezoneOffsetSeconds) * 1000;
  const date = new Date(localMs);

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  };

  // Use UTC methods since we already shifted the time manually
  return date.toLocaleString("en-US", { ...options, timeZone: "UTC" });
}

// Swaps the background gradient class depending on weather
// condition, and whether the icon code indicates night ("n").
function updateBackground(mainCondition, iconCode) {
  // Reset any previous weather classes
  bgLayer.className = "bg-layer";

  const isNight = iconCode.endsWith("n");

  if (isNight) {
    bgLayer.classList.add("weather-night");
    return;
  }

  switch (mainCondition) {
    case "Clear":
      bgLayer.classList.add("weather-clear");
      break;
    case "Clouds":
      bgLayer.classList.add("weather-clouds");
      break;
    case "Rain":
    case "Drizzle":
      bgLayer.classList.add("weather-rain");
      break;
    case "Snow":
      bgLayer.classList.add("weather-snow");
      break;
    case "Thunderstorm":
      bgLayer.classList.add("weather-thunder");
      break;
    default:
      bgLayer.classList.add("weather-clear");
  }
}

/* -----------------------------------------------------------
   7. UI STATE HELPERS (loader / error / card visibility)
   ----------------------------------------------------------- */
function showLoader() {
  loader.classList.remove("hidden");
  errorBox.classList.add("hidden");
  weatherCard.classList.add("hidden");
  emptyState.classList.add("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

function showError(message) {
  hideLoader();
  weatherCard.classList.add("hidden");
  emptyState.classList.add("hidden");
  errorText.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
}
