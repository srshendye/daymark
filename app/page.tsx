"use client";
import {
  Search,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  CloudSun,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudFog,
  CloudLightning,
  Plus,
  Clock3,
  Check,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
type MarketData = {
  symbol: string;
  date: string;
  price: number;
  change: number;
  changePercent: number;
  positive: boolean;
  history: {
    date: string;
    price: number;
  }[];
};

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

type Weather = {
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  windSpeed: number;
  high: number;
  low: number;
};

type Task = {
  id: string;
  text: string;
  completed: boolean;
};
function getWeatherDescription(code: number) {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorms";

  return "Unknown conditions";
}
function getWeatherIcon(code: number) {
  if (code === 0) return Sun;
  if (code <= 3) return CloudSun;
  if (code <= 48) return CloudFog;
  if (code <= 67) return CloudRain;
  if (code <= 77) return CloudSnow;
  if (code <= 82) return CloudRain;
  if (code <= 86) return CloudSnow;
  if (code <= 99) return CloudLightning;

  return Cloud;
}

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
  const [weather, setWeather] = useState<Weather | null>(null);
const [weatherLoading, setWeatherLoading] = useState(true);
const [weatherError, setWeatherError] = useState(false);
const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"todo" | "notes">("todo");

const [marketData, setMarketData] = useState<MarketData | null>(null);
const [marketLoading, setMarketLoading] = useState(true);
const [marketError, setMarketError] = useState(false);
const [marketRequested, setMarketRequested] = useState(false);

const [tasks, setTasks] = useState<Task[]>([]);
const [tasksLoaded, setTasksLoaded] = useState(false);
const [newTask, setNewTask] = useState("");

// Load saved tasks
useEffect(() => {
  const savedTasks = localStorage.getItem("daymark-tasks");

  if (savedTasks) {
    try {
      setTasks(JSON.parse(savedTasks));
    } catch {
      console.error("Could not load saved tasks.");
    }
  }

  setTasksLoaded(true);
}, []);

// Save tasks whenever they change
useEffect(() => {
  if (tasksLoaded) {
    localStorage.setItem("daymark-tasks", JSON.stringify(tasks));
  }
}, [tasks, tasksLoaded]);

useEffect(() => {
  const fetchWeather = async () => {
    try {
      const response = await fetch("/api/weather");

      if (!response.ok) {
        throw new Error("Weather request failed");
      }

      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error("Weather error:", error);
      setWeatherError(true);
    } finally {
      setWeatherLoading(false);
    }
  };

  fetchWeather();
}, []);
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

const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const text = newTask.trim();

  if (!text) return;

  setTasks((current) => [
    ...current,
    {
      id: crypto.randomUUID(),
      text,
      completed: false,
    },
  ]);

  setNewTask("");
};

const handleToggleTask = (id: string) => {
  setTasks((current) =>
    current.map((task) =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    )
  );
};

const handleRemoveTask = (id: string) => {
  setTasks((current) => current.filter((task) => task.id !== id));
};
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

// Fetch S&P 500 market data after the watchlist finishes loading
useEffect(() => {
  if (!watchlistLoaded || marketRequested) return;

  const watchlistFinished = stocks.every(
    (stock) => stock.price !== null || Boolean(stock.error)
  );

  if (!watchlistFinished) return;

  setMarketRequested(true);
  const fetchMarketData = async () => {
  try {
    // Allow time between the final watchlist request and SPY
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const response = await fetch("/api/stocks?symbol=SPY");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to retrieve market data.");
      }

      setMarketData(data);
    } catch (error) {
      console.error("Market data error:", error);
      setMarketError(true);
    } finally {
      setMarketLoading(false);
    }
  };

  void fetchMarketData();
}, [stocks, watchlistLoaded, marketRequested]);


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
    <h1> Today is a <em>good day</em> to have a <em>good day.</em></h1>
    <p className="welcome-subtitle">
      Make today your masterpiece. 
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
        <Widget className="workspace-widget">
  <SectionLabel number="01">DAILY WORKSPACE</SectionLabel>

  <div className="widget-heading">
    <h2>{activeWorkspaceTab === "todo" ? "Today's focus" : "A thought for today"}</h2>

    <div className="workspace-tabs">
      <button
        type="button"
        className={`workspace-tab ${activeWorkspaceTab === "todo" ? "active" : ""}`}
        onClick={() => setActiveWorkspaceTab("todo")}
      >
        To-do
      </button>

      <button
        type="button"
        className={`workspace-tab ${activeWorkspaceTab === "notes" ? "active" : ""}`}
        onClick={() => setActiveWorkspaceTab("notes")}
      >
        Notes
      </button>
    </div>
  </div>

  {activeWorkspaceTab === "todo" ? (
    <>
      <div className="todo-summary">
        <span>
          {tasks.filter((task) => task.completed).length} OF {tasks.length} COMPLETE
        </span>
        <span>
          {tasks.length === 0
            ? "A fresh start"
            : `${tasks.filter((task) => !task.completed).length} remaining`}
        </span>
      </div>

      <div className="todo-list">
        {tasks.length === 0 ? (
          <p className="todo-empty">
            Nothing on your list yet. Add a task to get started.
          </p>
        ) : (
          tasks.map((task) => (
            <div
              className={`todo-item ${task.completed ? "completed" : ""}`}
              key={task.id}
            >
              <label className="todo-label">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                />
                <span>{task.text}</span>
              </label>

              <button
                type="button"
                className="todo-remove"
                aria-label={`Remove ${task.text}`}
                onClick={() => handleRemoveTask(task.id)}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <form className="todo-add-form" onSubmit={handleAddTask}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a task..."
          aria-label="New task"
        />

        <button type="submit" aria-label="Add task">
          <Plus size={16} />
        </button>
      </form>
    </>
  ) : (
    <>
      <textarea
        placeholder="What is on your mind today?"
        aria-label="Daily notes"
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSubmitted(false);
        }}
      />

      <div className="notes-footer">
        <span>Your space, your pace.</span>

        <div className="notes-actions">
          {submitted && <span className="save-status">Saved</span>}

          <button
            type="button"
            className="icon-action"
            aria-label="Save note"
            onClick={handleNotesSubmit}
          >
            <Check size={16} />
          </button>
        </div>
      </div>
    </>
  )}
</Widget>

        
<Widget className="market-widget">
  <SectionLabel number="02">MARKETS</SectionLabel>

  <div className="widget-heading">
    <h2>Market snapshot</h2>
    <span className="live-indicator">
      <span />
      {marketLoading
        ? "LOADING"
        : marketError || !marketData
          ? "UNAVAILABLE"
          : "LATEST DATA"}
    </span>
  </div>

  {marketLoading ? (
    <p className="market-message">Loading market data...</p>
  ) : marketError || !marketData ? (
    <p className="market-message">
      Market data is currently unavailable.
    </p>
  ) : (
    <>
      <div className="market-summary">
        <div>
          <span className="data-label">S&P 500 · SPY</span>
          <p className="market-value">
            ${marketData.price.toFixed(2)}
          </p>
        </div>

        <div className={`market-change ${marketData.positive ? "positive" : "negative"}`}>
          {marketData.positive ? (
            <ArrowUpRight size={15} />
          ) : (
            <ArrowDownRight size={15} />
          )}
          {marketData.positive ? "+" : ""}
          {marketData.changePercent.toFixed(2)}%
        </div>
      </div>

      <div className="market-chart">
        <svg
          viewBox="0 0 500 110"
          preserveAspectRatio="none"
          role="img"
          aria-label="SPY historical closing prices over the last 30 trading days"
        >
          <defs>
            <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#899c87" stopOpacity=".24" />
              <stop offset="100%" stopColor="#899c87" stopOpacity="0" />
            </linearGradient>
          </defs>

          {(() => {
            const prices = marketData.history.map((point) => point.price);
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            const range = max - min || 1;

            const points = prices.map((price, index) => ({
              x: (index / (prices.length - 1)) * 500,
              y: 90 - ((price - min) / range) * 75,
            }));

            const line = points
              .map((point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
              )
              .join(" ");

            const area = `${line} L 500 110 L 0 110 Z`;

            return (
              <>
                <path d={area} fill="url(#chartFill)" />
                <path
                  d={line}
                  fill="none"
                  stroke="#899c87"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            );
          })()}
        </svg>
      </div>

      <div className="chart-labels">
        <span>{marketData.history[0]?.date}</span>
        <span>
          {marketData.history[Math.floor(marketData.history.length / 2)]?.date}
        </span>
        <span>{marketData.history[marketData.history.length - 1]?.date}</span>
      </div>

      <div className="market-footer">
        <span>Last updated: {marketData.date}</span>
        <span>30D</span>
      </div>
    </>
  )}
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

  {weatherLoading ? (
    <p>Loading weather...</p>
  ) : weatherError || !weather ? (
    <p>Weather currently unavailable.</p>
  ) : (
    <>
      <div className="weather-main">
        {(() => {
  const WeatherIcon = getWeatherIcon(weather.weatherCode);

  return <WeatherIcon size={43} strokeWidth={1.1} />;
})()}

        <div className="temperature">
          {Math.round(weather.temperature)}°
        </div>

        <div className="weather-description">
          <strong>
            {getWeatherDescription(weather.weatherCode)}
          </strong>
          <span>
            Feels like {Math.round(weather.feelsLike)}°
          </span>
        </div>
      </div>

      <div className="weather-details">
        <div>
          <span>HIGH</span>
          <strong>{Math.round(weather.high)}°</strong>
        </div>

        <div>
          <span>LOW</span>
          <strong>{Math.round(weather.low)}°</strong>
        </div>

        <div>
          <span>WIND</span>
          <strong>{Math.round(weather.windSpeed)} km/h</strong>
        </div>
      </div>
    </>
  )}
</Widget>
      </div>

      <footer className="footer">
        <span>DAYMARK © 2026</span>
        <span>YOUR DAY, AT A GLANCE.</span>
      </footer>
    </main>
  );
}
