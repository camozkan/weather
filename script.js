// API için gerekli değişkenler
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// DOM elementleri
const locationInput = document.getElementById('location-input');
const weatherInfo = document.getElementById('weather-info');
const forecastContainer = document.getElementById('forecast-container');

// Enter tuşuna basıldığında arama yapma
locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// Hava durumu ikonları için WMO kodlarını kullanma
const getWeatherIcon = (code) => {
    const iconMap = {
        0: '☀️',  // Clear sky
        1: '🌤️',  // Mainly clear
        2: '⛅',  // Partly cloudy
        3: '☁️',  // Overcast
        45: '🌫️', // Foggy
        48: '🌫️', // Depositing rime fog
        51: '🌧️', // Light drizzle
        53: '🌧️', // Moderate drizzle
        55: '🌧️', // Dense drizzle
        61: '🌧️', // Slight rain
        63: '🌧️', // Moderate rain
        65: '🌧️', // Heavy rain
        71: '🌨️', // Slight snow
        73: '🌨️', // Moderate snow
        75: '🌨️', // Heavy snow
        77: '🌨️', // Snow grains
        80: '🌧️', // Slight rain showers
        81: '🌧️', // Moderate rain showers
        82: '🌧️', // Violent rain showers
        85: '🌨️', // Slight snow showers
        86: '🌨️', // Heavy snow showers
        95: '⛈️', // Thunderstorm
        96: '⛈️', // Thunderstorm with slight hail
        99: '⛈️'  // Thunderstorm with heavy hail
    };
    return iconMap[code] || '❓';
};

// Tarihi formatla
const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });
};

// Hava durumu araması
async function searchWeather() {
    const location = locationInput.value;
    if (!location) return;

    try {
        // Koordinatları al
        const geoResponse = await fetch(`${GEOCODING_API}?name=${encodeURIComponent(location)}&count=1`);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert('Konum bulunamadı. Lütfen başka bir konum deneyin.');
            return;
        }

        const { latitude, longitude, name } = geoData.results[0];

        // Hava durumu verilerini al
        const weatherResponse = await fetch(
            `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const weatherData = await weatherResponse.json();

        // Mevcut hava durumunu göster
        document.getElementById('location').textContent = name;
        document.getElementById('temperature').textContent = 
            `${Math.round(weatherData.current.temperature_2m)}°C`;
        document.getElementById('weather-icon').textContent = 
            getWeatherIcon(weatherData.current.weather_code);
        document.getElementById('humidity').textContent = 
            `${weatherData.current.relative_humidity_2m}%`;
        document.getElementById('wind').textContent = 
            `${Math.round(weatherData.current.wind_speed_10m)} km/s`;

        // 7 günlük tahmini göster
        forecastContainer.innerHTML = '';
        for (let i = 0; i < 7; i++) {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="date">${formatDate(weatherData.daily.time[i])}</div>
                <div class="icon">${getWeatherIcon(weatherData.daily.weather_code[i])}</div>
                <div class="temp">
                    ${Math.round(weatherData.daily.temperature_2m_max[i])}°
                    <span class="min-temp">
                        ${Math.round(weatherData.daily.temperature_2m_min[i])}°
                    </span>
                </div>
            `;
            forecastContainer.appendChild(forecastItem);
        }

        weatherInfo.style.display = 'block';
    } catch (error) {
        console.error('Hava durumu bilgisi alınamadı:', error);
        alert('Hava durumu bilgisi alınamadı. Lütfen tekrar deneyin.');
    }
} 