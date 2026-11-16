
import { NextResponse } from "next/server";

export async function GET() {
    const url = new URL("https://api.open-meteo.com/v1/forecast");

    url.searchParams.set("latitude", "51.0447");
    url.searchParams.set("longitude", "-114.0719");
    url.searchParams.set(
        "current",
        "temperature_2m,apparent_temperature,weather_code,wind_speed_10m"
    );
    url.searchParams.set(
        "daily",
        "temperature_2m_max,temperature_2m_min"
    );
    url.searchParams.set("temperature_unit", "celsius");
    url.searchParams.set("wind_speed_unit", "kmh");
    url.searchParams.set("timezone", "America/Edmonton");

    try {
        const response = await fetch(url.toString(), {
            next: { revalidate: 900 },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Unable to retrieve weather data" },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            temperature: data.current.temperature_2m,
            feelsLike: data.current.apparent_temperature,
            weatherCode: data.current.weather_code,
            windSpeed: data.current.wind_speed_10m,
            high: data.daily.temperature_2m_max[0],
            low: data.daily.temperature_2m_min[0],
        });
    } catch {
        return NextResponse.json(
            { error: "Weather service unavailable" },
            { status: 500 }
        );
    }
}
