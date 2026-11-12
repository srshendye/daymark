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
import { useRef } from "react";

const watchlist = [
  { symbol: "NVDA", name: "NVIDIA", price: "186.52", change: "+2.41%", positive: true },
  { symbol: "AAPL", name: "Apple", price: "273.18", change: "+0.84%", positive: true },
  { symbol: "MSFT", name: "Microsoft", price: "512.30", change: "-0.62%", positive: false },
  { symbol: "GOOGL", name: "Alphabet", price: "295.61", change: "+1.12%", positive: true },
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
  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark">d.</span>
          <span>daymark</span>
        </a>
        <div className="topbar-right">
          <span className="date-small">THURSDAY, NOVEMBER 12</span>
          <div className="avatar">S</div>
        </div>
      </header>

      
  <section className="welcome">
    <p className="eyebrow">THURSDAY, NOVEMBER 12, 2026</p>
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
        onSubmit={()=>{
          if (searchRef.current){
            searchRef.current.value = "";
          }
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
        <span className="muted">THURSDAY / 01</span>
      </div>

      <div className="widget-grid">
        <Widget className="calendar-widget">
          <SectionLabel number="01">CALENDAR</SectionLabel>
          <div className="widget-heading">
            <h2>Today&apos;s agenda</h2>
            <CalendarDays size={18} />
          </div>
          <div className="agenda-date">
            <span className="agenda-day">12</span>
            <div>
              <p>Thursday</p>
              <span>November 2026</span>
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
            <button className="icon-action" aria-label="Add stock"><Plus size={17} /></button>
          </div>
          <div className="watchlist">
            {watchlist.map((stock) => (
              <div className="stock-row" key={stock.symbol}>
                <div className="stock-identity">
                  <span className="stock-symbol">{stock.symbol}</span>
                  <span className="stock-name">{stock.name}</span>
                </div>
                <div className="stock-prices">
                  <strong>${stock.price}</strong>
                  <span className={stock.positive ? "positive" : "negative"}>
                    {stock.positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {stock.change}
                  </span>
                </div>
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
          <textarea placeholder="What is on your mind today?" aria-label="Daily notes" />
          <div className="notes-footer">
            <span>Your space, your pace.</span>
            <button className="icon-action" aria-label="Save note"><Check size={16} /></button>
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
