
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const symbol = searchParams.get("symbol")?.trim().toUpperCase();

        if (!symbol || !/^[A-Z0-9.-]{1,12}$/.test(symbol)) {
            return NextResponse.json(
                { error: "Please provide a valid ticker symbol." },
                { status: 400 }
            );
        }

        const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "Market data API key is not configured." },
                { status: 500 }
            );
        }

        const url = new URL("https://www.alphavantage.co/query");
        url.searchParams.set("function", "TIME_SERIES_DAILY");
        url.searchParams.set("symbol", symbol);
        url.searchParams.set("outputsize", "compact");
        url.searchParams.set("apikey", apiKey);

        const response = await fetch(url.toString(), {
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error("Unable to retrieve market data.");
        }

        const data = await response.json();

        if (data["Error Message"] || data["Information"] || data["Note"]) {
            return NextResponse.json(
                { error: data["Error Message"] || data["Information"] || data["Note"] },
                { status: 502 }
            );
        }

        const timeSeries = data["Time Series (Daily)"];

        if (!timeSeries) {
            return NextResponse.json(
                { error: "No daily market data was returned." },
                { status: 502 }
            );
        }

        const dates = Object.keys(timeSeries).sort().reverse();

        if (dates.length < 2) {
            return NextResponse.json(
                { error: "Not enough price history to calculate daily change." },
                { status: 502 }
            );
        }

        const latestDate = dates[0];
        const previousDate = dates[1];

        const latestPrice = Number(timeSeries[latestDate]["4. close"]);
        const previousPrice = Number(timeSeries[previousDate]["4. close"]);

        const change = latestPrice - previousPrice;
        const changePercent = (change / previousPrice) * 100;

        return NextResponse.json({
            symbol,
            date: latestDate,
            price: latestPrice,
            change,
            changePercent,
            positive: change >= 0,
        });
    } catch (error) {
        console.error("Stock API error:", error);

        return NextResponse.json(
            { error: "Something went wrong retrieving stock data." },
            { status: 500 }
        );
    }
}
