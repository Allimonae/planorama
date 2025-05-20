import fetch from 'node-fetch';
import dotenv from "dotenv";

dotenv.config();

export async function getWeatherForecast(lat, lon) {
  const url =
    process.env.OPENWEATHER_API_URL;

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
