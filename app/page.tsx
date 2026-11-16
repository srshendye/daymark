"use client";
import {
  Search,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  CloudSun,
  Plus,
  Clock3,
  Check,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

type Stock = {
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  positive: boolean;
  loading: boolean;
  error?: string;
  date?: string;
};

const initialWatchlist: Stock[] = [
  { symbol: "NVDA", name: "NVIDIA", price: null, changePercent: null, positive: true, loading: false },
  { symbol: "AAPL", name: "Apple", price: null, changePercent: null, positive: true, loading: false },
  { symbol: "MSFT", name: "Microsoft", price: null, changePercent: null, positive: true, loading: false },
  { symbol: "GOOGL", name: "Alphabet", price: null, changePercent: null, positive: true, loading: false },
];

const events = [
  { time: "09:30", title: "Morning planning", detail: "Personal" },
  { time: "11:00", title: "Project work", detail: "Daymark" },
  { time: "14:00", title: "Reading & research", detail: "Personal" },
  { time: "16:30", title: "Review the week", detail: "Planning" },
];

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div className="section-label">
      <span>{number}</span>
      <span>{children}</span>
    </div>
  );
}

function Widget({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`widget ${className}`}>{children}</section>;
}

export default function Home() {
  const searchRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState("");
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const [stocks, setStocks] = useState(initialWatchlist);
  const [watchlistLoaded, setWatchlistLoaded] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [newStockSymbol, setNewStockSymbol] = useState("");
  const [stockError, setStockError] = useState("");

useEffect(() => {
  const savedStocks = localStorage.getItem("daymark-watchlist");

  if (savedStocks) {
    try {
      const parsedStocks = JSON.parse(savedStocks);

      setStocks(
        parsedStocks.map((stock: Stock) => ({
          symbol: stock.symbol,
          name: stock.name || stock.symbol,
          price: null,
          changePercent: null,
          positive: true,
          loading: false,
        }))
      );
    } catch {
      console.error("Could not load saved watchlist.");
    }
  }

  setWatchlistLoaded(true);
}, []);

// Save watchlist whenever it changes
useEffect(() => {
  if (watchlistLoaded) {
    localStorage.setItem("daymark-watchlist", JSON.stringify(stocks));
  }
}, [stocks, watchlistLoaded]);

const handleAddStock = (e: React.SyntheticEvent<HTMLFormElement>) => {
  e.preventDefault();

  const symbol = newStockSymbol.trim().toUpperCase();

  if (!symbol) return;

  if (!/^[A-Z0-9.-]{1,12}$/.test(symbol)) {
    setStockError("Please enter a valid ticker.");
    return;
  }

  if (stocks.some((stock) => stock.symbol === symbol)) {
    setStockError("Already in your watchlist.");
    return;
  }

  setStocks((current) => [
    ...current,
    {
  symbol,
  name: symbol,
  price: null,
  changePercent: null,
  positive: true,
  loading: false,
},
  ]);

  setNewStockSymbol("");
  setStockError("");
  setShowAddStock(false);
};

// Fetch market data for stocks without prices
useEffect(() => {
  if (!watchlistLoaded) return;

  const pendingStocks = stocks.filter(
    (stock) =>
      stock.price === null &&
      !stock.loading &&
      !stock.error
  );

  if (pendingStocks.length === 0) return;

  const symbols = pendingStocks.map((stock) => stock.symbol);

  setStocks((current) =>
    current.map((stock) =>
      symbols.includes(stock.symbol)
        ? { ...stock, loading: true }
        : stock
    )
  );

  const fetchStockData = async (symbol: string) => {
    try {
      const response = await fetch(
        `/api/stocks?symbol=${encodeURIComponent(symbol)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to fetch stock.");
      }

      setStocks((current) =>
        current.map((stock) =>
          stock.symbol === symbol
            ? {
                ...stock,
                price: data.price,
                changePercent: data.changePercent,
                positive: data.positive,
                date: data.date,
                loading: false,
                error: undefined,
              }
            : stock
        )
      );
    } catch (error) {
      setStocks((current) =>
        current.map((stock) =>
          stock.symbol === symbol
            ? {
                ...stock,
                loading: false,
                error: "Unable to retrieve data",
              }
            : stock
        )
      );
    }
  };

  const fetchStocksSequentially = async () => {
  for (const stock of pendingStocks) {
    await fetchStockData(stock.symbol);

    // Wait 1.2 seconds before the next request
    await new Promise((resolve) =>
      setTimeout(resolve, 1200)
    );
  }
};

void fetchStocksSequentially();
}, [stocks, watchlistLoaded]);


const handleRemoveStock = (symbol: string) => {
  setStocks((current) =>
    current.filter((stock) => stock.symbol !== symbol)
  );
};


const formatDate = (date: Date) =>{
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long", 
      year: "numeric",
      day: "numeric",
      month: "long",
    }
    console.log('date', date.toLocaleDateString("en-CA", options))

    return date.toLocaleDateString("en-CA", options)
  };
  
  useEffect(()=>{
    setToday(new Date())
  }, [])

  
  useEffect(()=>{
    const savedNotes = localStorage.getItem("daymark-notes");
    if (savedNotes !== null){
      setNotes(savedNotes)
    }
    setNotesLoaded(true);

  }, []); //load on mount from local storage

  const handleNotesSubmit = () =>{
    localStorage.setItem("daymark-notes", notes)
    setSubmitted(true)
  }; 

  useEffect(()=>{ //save to storage when the written note changes
    if(notesLoaded){
      localStorage.setItem("daymark-notes", notes);
      console.log(localStorage.getItem("daymark-notes"))
    }
  }, [notes, notesLoaded])


  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark">d.</span>
          <span>daymark</span>
        </a>
        <div className="topbar-right">
          <span className="date-small">{today? formatDate(today).toUpperCase() : ""}</span>
          <div className="avatar">S</div>
        </div>
      </header>

      
  <section className="welcome">
    <p className="eyebrow">{today? formatDate(today).toUpperCase() : ""}</p>
    <h1>Your day, <em>in perspective.</em></h1>
    <p className="welcome-subtitle">
      A little space to think, plan, and stay informed.
    </p>

    <div className="search-wrap">
      <Search size={19} strokeWidth={1.6} />

      <form
        action="https://www.google.com/search"
        method="GET"
        target="_blank"
        onSubmit={() => {
  setTimeout(() => {
    if (searchRef.current) {
      searchRef.current.value = "";
    }
  }, 100);
}}
      >
        <input
        ref={searchRef}
          type="search"
          name="q"
          placeholder="Search anything, or find something to focus on..."
          aria-label="Search Google"
        />
      </form>
      <span className="search-shortcut">⌘ K</span>
    </div>
  </section>


      <div className="dashboard-heading">
        <span>YOUR OVERVIEW</span>
        <span className="heading-line" />
        <span className="muted">{today?.toLocaleDateString("en-CA", {weekday: "long"}).toUpperCase() ?? ""} / {today?.toLocaleDateString("en-CA", {day: "2-digit"}) ?? ""} </span>
      </div>

      <div className="widget-grid">
        <Widget className="calendar-widget">
          <SectionLabel number="01">CALENDAR</SectionLabel>
          <div className="widget-heading">
            <h2>Today&apos;s agenda</h2>
            <CalendarDays size={18} />
          </div>
          <div className="agenda-date">
            <span className="agenda-day">{today?.getDate() ?? "--"}</span>
            <div>
              <p>{today?.toLocaleDateString("en-CA", { weekday: "long" }) ?? ""}</p>
              <span>{today?.toLocaleDateString("en-CA", {
        month: "long",
        year: "numeric",
      }) ?? ""}</span>
            </div>
          </div>
          <div className="event-list">
            {events.map((event, index) => (
              <div className="event" key={event.title}>
                <span className="event-time">{event.time}</span>
                <span className={`event-dot dot-${index}`} />
                <div className="event-info">
                  <strong>{event.title}</strong>
                  <span>{event.detail}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="text-action">View calendar <ArrowUpRight size={14} /></button>
        </Widget>

        <Widget className="market-widget">
          <SectionLabel number="02">MARKETS</SectionLabel>
          <div className="widget-heading">
            <h2>Market snapshot</h2>
            <span className="live-indicator"><span /> SAMPLE DATA</span>
          </div>
          <div className="market-summary">
            <div>
              <span className="data-label">S&P 500</span>
              <p className="market-value">6,850.92</p>
            </div>
            <div className="market-change positive">
              <ArrowUpRight size={15} /> 0.72%
            </div>
          </div>
          <div className="market-chart">
            <svg viewBox="0 0 500 110" preserveAspectRatio="none" role="img" aria-label="Illustrative market movement chart">
              <defs>
                <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#899c87" stopOpacity=".24" />
                  <stop offset="100%" stopColor="#899c87" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 85 C30 80 35 65 60 72 S100 90 125 60 S165 75 190 50 S220 55 250 42 S285 62 315 36 S355 48 380 27 S420 45 445 18 S480 28 500 8 L500 110 L0 110 Z" fill="url(#chartFill)" />
              <path d="M0 85 C30 80 35 65 60 72 S100 90 125 60 S165 75 190 50 S220 55 250 42 S285 62 315 36 S355 48 380 27 S420 45 445 18 S480 28 500 8" fill="none" stroke="#899c87" strokeWidth="2" />
            </svg>
          </div>
          <div className="chart-labels"><span>9:30 AM</span><span>12 PM</span><span>4 PM</span></div>
          <div className="market-footer">
            <span>Illustrative values, not live market data</span>
            <span>1D</span>
          </div>
        </Widget>

        <Widget className="watchlist-widget">
          <SectionLabel number="03">WATCHLIST</SectionLabel>
          <div className="widget-heading">
            <h2>On your radar</h2>
            <button
  className="icon-action"
  aria-label="Add stock"
  onClick={() => {
    setShowAddStock(!showAddStock);
    setStockError("");
  }}
>
  <Plus size={17} />
</button>
          </div>
          {showAddStock && (
  <form className="add-stock-form" onSubmit={handleAddStock}>
    <input
      type="text"
      value={newStockSymbol}
      onChange={(e) => {
        setNewStockSymbol(e.target.value);
        setStockError("");
      }}
      placeholder="Search by ticker symbol..."
      autoFocus
      maxLength={12}
      aria-label="Stock ticker symbol"
    />

    <button type="submit">Add ticker</button>

    {stockError && (
      <p className="stock-error">{stockError}</p>
    )}
  </form>
)}
          <div className="watchlist">
            {stocks.map((stock) => (
              <div className="stock-row" key={stock.symbol}>
                <div className="stock-identity">
                  <span className="stock-symbol">{stock.symbol}</span>
                  <span className="stock-name">{stock.name}</span>
                </div>
                <div className="stock-prices">
  <strong>
    {stock.loading
      ? "Loading..."
      : stock.price !== null
        ? `$${stock.price.toFixed(2)}`
        : "—"}
  </strong>

  <span className={stock.positive ? "positive" : "negative"}>
    {stock.changePercent !== null && (
      <>
        {stock.positive ? (
          <ArrowUpRight size={13} />
        ) : (
          <ArrowDownRight size={13} />
        )}

        {stock.positive ? "+" : ""}
        {stock.changePercent.toFixed(2)}%
      </>
    )}

    {stock.error && "Unavailable"}
  </span>
</div>

<button
  className="remove-stock"
  aria-label={`Remove ${stock.symbol}`}
  onClick={() => handleRemoveStock(stock.symbol)}
>
  ×
</button>
              </div>
            ))}
          </div>
          <button className="text-action">Explore markets <ArrowUpRight size={14} /></button>
        </Widget>

        <Widget className="weather-widget">
          <SectionLabel number="04">WEATHER</SectionLabel>
          <div className="widget-heading">
            <h2>Outside</h2>
            <span className="location-label">CALGARY, AB</span>
          </div>
          <div className="weather-main">
            <CloudSun size={43} strokeWidth={1.1} />
            <div className="temperature">8°</div>
            <div className="weather-description">
              <strong>Partly cloudy</strong>
              <span>Feels like 6°</span>
            </div>
          </div>
          <div className="weather-details">
            <div><span>HIGH</span><strong>11°</strong></div>
            <div><span>LOW</span><strong>2°</strong></div>
            <div><span>WIND</span><strong>12 km/h</strong></div>
          </div>
          <p className="sample-note">Illustrative weather data</p>
        </Widget>

        <Widget className="notes-widget">
          <SectionLabel number="05">DAILY NOTES</SectionLabel>
          <div className="widget-heading">
            <h2>A thought for today</h2>
            <Clock3 size={17} />
          </div>
          <textarea placeholder="What is on your mind today?" aria-label="Daily notes" 
          value={notes}
          onChange={(e)=> {
            setNotes(e.target.value)
            setSubmitted(false)
          } }/>
          
<div className="notes-footer">
  <span>Your space, your pace.</span>

  <div className="notes-actions">
    {submitted && (
      <span className="save-status">Saved</span>
    )}

    <button
      className="icon-action"
      aria-label="Save note"
      onClick={handleNotesSubmit}
    >
      <Check size={16} />
    </button>
  </div>
</div>

        </Widget>
      </div>

      <footer className="footer">
        <span>DAYMARK © 2026</span>
        <span>YOUR DAY, AT A GLANCE.</span>
      </footer>
    </main>
  );
}
