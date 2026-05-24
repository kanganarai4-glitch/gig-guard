const axios = require('axios');

const WEATHER_KEY = process.env.WEATHER_API_KEY;
const AQI_KEY = process.env.AQI_API_KEY;

/**
 * Get rain data for a city from OpenWeatherMap.
 * Returns rain in mm/hr. Falls back to random mock value if API fails.
 */
const getWeather = async (city = 'Mumbai') => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${WEATHER_KEY}&units=metric`;
    const { data } = await axios.get(url, { timeout: 5000 });
    // rain.1h = mm in last hour; may be absent if no rain
    const rain = data.rain?.['1h'] ?? 0;
    const description = data.weather?.[0]?.description ?? 'clear';
    return { 
      rain, 
      description, 
      temp: data.main?.temp ?? 30,
      humidity: data.main?.humidity ?? 80,
      pressure: data.main?.pressure ?? 1010,
      wind: data.wind?.speed ?? 5,
      visibility: (data.visibility ?? 10000) / 1000 // Convert m to km
    };
  } catch (err) {
    console.warn(`⚠️  Weather API error for ${city}: ${err.message} — using mock data`);
    // Mock: random values
    return { 
      rain: Math.random() * 30, 
      description: 'mock data', 
      temp: 30,
      humidity: 85,
      pressure: 1005,
      wind: 15,
      visibility: 5
    };
  }
};

/**
 * Get AQI for a city from WAQI.
 * Falls back to random mock value if API fails.
 */
const getAQI = async (city = 'mumbai') => {
  try {
    const url = `https://api.waqi.info/feed/${city.toLowerCase()}/?token=${AQI_KEY}`;
    const { data } = await axios.get(url, { timeout: 5000 });
    if (data.status !== 'ok') throw new Error('WAQI returned non-ok status');
    return { aqi: data.data.aqi ?? 0, station: data.data.city?.name ?? city };
  } catch (err) {
    console.warn(`⚠️  AQI API error for ${city}: ${err.message} — using mock data`);
    // Mock: random AQI 50–400
    return { aqi: Math.floor(Math.random() * 350 + 50), station: 'mock' };
  }
};

module.exports = { getWeather, getAQI };
