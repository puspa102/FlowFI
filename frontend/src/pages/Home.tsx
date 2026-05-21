import './Home.css'

const trustedLogos = ['Velocity', 'Cryptos', 'Quantum', 'Nexus']

const featureCards = [
  {
    title: 'AI Insights',
    copy:
      'Predictive modeling that identifies market trends and tax optimization opportunities before they arise.',
    tag: 'Trend Signals',
  },
  {
    title: 'OCR Scanning',
    copy:
      'Instant document ingestion. Snap a photo of a statement or receipt and let our AI categorize every cent.',
    tag: 'Smart Capture',
  },
  {
    title: 'Smart Budgets',
    copy:
      'Adaptive envelopes that learn your lifestyle and adjust goals dynamically to ensure you stay on track.',
    tag: 'Auto-Adjust',
  },
  {
    title: 'Wealth Engineering',
    copy:
      'Consolidate disparate assets from crypto to real estate into a unified source of truth.',
    tag: 'Unified View',
  },
]

export default function Home() {
  return (
    <div className="home-shell">
      <header className="home-header">
        <div className="brand">
          <span className="brand-mark">FloFi</span>
          <span className="brand-dot" aria-hidden="true" />
        </div>
        <nav className="home-nav" aria-label="Primary">
          <a href="#platform">Platform</a>
          <a href="#solutions">Solutions</a>
          <a href="#insights">AI Insights</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="home-actions">
          <button className="ghost-button" type="button">
            Log in
          </button>
          <button className="primary-button" type="button">
            Get Started
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="platform">
          <div className="hero-copy">
            <span className="hero-pill">New powered by GPT-4o</span>
            <h1>
              Precision Wealth <span>Engineering</span>
            </h1>
            <p>
              AI-powered financial insights for the next generation of wealth. Professional-grade analytics
              delivered through a seamless, glass-morphic interface.
            </p>
            <div className="hero-cta">
              <button className="primary-button" type="button">
                Get Started Free
              </button>
              <button className="ghost-button" type="button">
                Watch Demo
              </button>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="glass-frame">
              <div className="device-grid">
                <div className="device-card">
                  <div className="device-chip" />
                  <div className="device-line" />
                  <div className="device-ring" />
                </div>
                <div className="device-card is-center">
                  <div className="device-chip" />
                  <div className="device-chart" />
                  <div className="device-line" />
                </div>
                <div className="device-card">
                  <div className="device-chip" />
                  <div className="device-line" />
                  <div className="device-ring" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="trusted" aria-label="Trusted by">
          <p>Trusted by modern institutions</p>
          <div className="trusted-logos">
            {trustedLogos.map((logo) => (
              <span key={logo}>{logo}</span>
            ))}
          </div>
        </section>

        <section className="features" id="solutions">
          <div className="section-header">
            <h2>Engineered for Performance</h2>
            <p>Advanced tools designed to simplify complex wealth management into actionable clarity.</p>
          </div>

          <div className="feature-grid">
            {featureCards.map((card) => (
              <article key={card.title} className="feature-card" id="insights">
                <div className="card-top">
                  <span className="card-pill">{card.tag}</span>
                  <h3>{card.title}</h3>
                </div>
                <p>{card.copy}</p>
                <div className="card-footer">
                  <div className="card-metric">
                    <span>+21%</span>
                    <small>YoY accuracy</small>
                  </div>
                  <div className="card-metric">
                    <span>$1.2M</span>
                    <small>Managed value</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="cta" id="pricing">
          <div className="cta-inner">
            <div>
              <h2>Ready to upgrade your financial IQ?</h2>
              <p>Join 50,000+ investors who use FloFi to navigate the future of wealth.</p>
            </div>
            <div className="cta-actions">
              <button className="primary-button" type="button">
                Start Your Free Trial
              </button>
              <button className="ghost-button" type="button">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div>
          <span className="brand-mark">FloFi</span>
          <p>Precision Wealth Engineering</p>
        </div>
        <div className="footer-links">
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms-of-service">Terms of Service</a>
          <a href="#">Security</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  )
}
