import fetch from 'node-fetch';

export async function getWeatherForecast(lat, lon) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=40.7128&lon=-74.0060&exclude=minutely,hourly,alerts&units=imperial&appid=036506298a139e4b9e2448051e0407f8`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.daily) {
      console.error("Unexpected weather API response:", data);
      return null;
    }

    return data.daily;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}
