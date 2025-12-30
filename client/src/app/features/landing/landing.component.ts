import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-wrapper">
      <!-- Navigation -->
      <nav class="navbar">
        <div class="container nav-content">
          <div class="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logo-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span class="logo-text">DMS<span>Pro</span></span>
          </div>
          <div class="nav-links">
            <a routerLink="/login" class="nav-link">Sign In</a>
            <a routerLink="/register" class="btn btn-primary">Get Started</a>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <header class="hero">
        <div class="container hero-content">
          <div class="hero-text">
            <div class="badge">New: Version 2.0 is here</div>
            <h1>Every document tells a story. <span>Make yours secure.</span></h1>
            <p>From scattered files to organized archives, transform how your team manages documents with enterprise-grade security and intelligent automation.</p>
            <div class="hero-actions">
              <a routerLink="/register" class="btn btn-primary btn-lg">Start Your Story</a>
              <a href="#story" class="btn btn-outline btn-lg">Learn More</a>
            </div>
            <div class="hero-stats">
              <div class="stat">
                <span class="stat-value">99.9%</span>
                <span class="stat-label">Uptime</span>
              </div>
              <div class="stat">
                <span class="stat-value">Unlimited</span>
                <span class="stat-label">Storage</span>
              </div>
              <div class="stat">
                <span class="stat-value">Real-time</span>
                <span class="stat-label">Collaboration</span>
              </div>
            </div>
          </div>
          <div class="hero-image">
            <div class="image-placeholder">
              <div class="ui-mockup">
                <div class="ui-sidebar"></div>
                <div class="ui-main">
                  <div class="ui-header"></div>
                  <div class="ui-grid">
                    <div class="ui-card"></div>
                    <div class="ui-card"></div>
                    <div class="ui-card"></div>
                    <div class="ui-card"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Story Section -->
      <section id="story" class="story">
        <div class="container">
          <div class="section-header">
            <h2>The Document Management Revolution</h2>
            <p>Imagine a world where your documents work for you, not against you.</p>
          </div>

          <div class="story-grid">
            <div class="story-chapter">
              <span class="emoji">📁</span>
              <div class="chapter-number">01</div>
              <h3>The Chaos of Disorganized Files</h3>
              <p>Scattered across drives, lost in emails, buried in folders. Your team's knowledge is trapped in a digital maze, costing hours of productivity and risking critical information loss.</p>
            </div>

            <div class="story-chapter">
              <span class="emoji">🔒</span>
              <div class="chapter-number">02</div>
              <h3>The Security Nightmare</h3>
              <p>Sensitive documents shared insecurely, version conflicts, unauthorized access. Traditional file systems leave your business vulnerable to data breaches and compliance violations.</p>
            </div>

            <div class="story-chapter">
              <span class="emoji">✨</span>
              <div class="chapter-number">03</div>
              <h3>The DMSPro Solution</h3>
              <p>One centralized platform that organizes, secures, and streamlines your document workflow. Intelligent tagging, granular permissions, and version control that adapts to your team's needs.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="features">
        <div class="container">
          <div class="section-header">
            <h2>Transform Your Document Workflow</h2>
            <p>Experience the difference with features designed to solve real problems.</p>
          </div>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon icon-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              </div>
              <h3>Smart Upload</h3>
              <p>Drag and drop multiple files at once. We support PDFs, images, and office documents with automatic metadata extraction.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon icon-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              </div>
              <h3>Advanced Tagging</h3>
              <p>Organize your documents with custom tags. Categorize by project, client, or department for instant retrieval.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon icon-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <h3>Instant Search</h3>
              <p>Find any document in seconds. Search by title, tags, or content with our high-performance indexing engine.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon icon-orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3>Granular Permissions</h3>
              <p>Control who can view or edit each document. Set permissions at the user level with full audit logs.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon icon-red">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </div>
              <h3>Version Control</h3>
              <p>Never lose a change. Track document history, compare versions, and restore previous states with one click.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon icon-teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <h3>Responsive Design</h3>
              <p>Access your documents from anywhere. Our platform works perfectly on desktops, tablets, and smartphones.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta">
        <div class="container">
          <div class="cta-box">
            <h2>Ready to write your success story?</h2>
            <p>Join thousands of teams who have transformed their document management with DMSPro.</p>
            <div class="cta-actions">
              <a routerLink="/register" class="btn btn-white btn-lg">Start Your Journey</a>
              <a routerLink="/login" class="btn btn-outline-white btn-lg">Sign In</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logo-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span class="logo-text">DMS<span>Pro</span></span>
              </div>
              <p>Secure, scalable, and smart document management for modern businesses.</p>
            </div>
            <div class="footer-links">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Security</a>
              <a href="#">Pricing</a>
            </div>
            <div class="footer-links">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
            </div>
            <div class="footer-links">
              <h4>Legal</h4>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2025 DMSPro Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing-wrapper {
      background-color: #fff;
      color: #1e293b;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Navbar */
    .navbar {
      height: 80px;
      display: flex;
      align-items: center;
      position: sticky;
      top: 0;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      z-index: 100;
      border-bottom: 1px solid #f1f5f9;
    }

    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      color: var(--primary);
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.025em;
    }

    .logo-text span {
      color: var(--primary);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .nav-link {
      font-weight: 500;
      color: #64748b;
      transition: color 0.2s;
    }

    .nav-link:hover {
      color: var(--primary);
      text-decoration: none;
    }

    /* Hero */
    .hero {
      padding: 6rem 0;
      overflow: hidden;
      background: radial-gradient(circle at top right, rgba(132, 204, 22, 0.05), transparent 40%),
                  radial-gradient(circle at bottom left, rgba(34, 197, 94, 0.05), transparent 40%);
    }

    .hero-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    @media (max-width: 992px) {
      .hero-content {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .hero-image {
        display: none;
      }
    }

    .badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: #f7fee7;
      color: var(--primary-dark);
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      border: 1px solid #ecfccb;
    }

    .hero-text h1 {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      letter-spacing: -0.025em;
    }

    .hero-text h1 span {
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-text p {
      font-size: 1.25rem;
      color: #64748b;
      margin-bottom: 2.5rem;
      max-width: 540px;
    }

    @media (max-width: 992px) {
      .hero-text p {
        margin-left: auto;
        margin-right: auto;
      }
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 3rem;
    }

    @media (max-width: 992px) {
      .hero-actions {
        justify-content: center;
      }
    }

    .btn-lg {
      padding: 1rem 2rem;
      font-size: 1rem;
    }

    .hero-stats {
      display: flex;
      gap: 3rem;
    }

    @media (max-width: 992px) {
      .hero-stats {
        justify-content: center;
      }
    }

    .stat {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
    }

    .hero-image {
      position: relative;
    }

    .image-placeholder {
      background: #f8fafc;
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .ui-mockup {
      background: #fff;
      border-radius: 12px;
      height: 400px;
      display: flex;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }

    .ui-sidebar {
      width: 80px;
      background: #f1f5f9;
      border-right: 1px solid #e2e8f0;
    }

    .ui-main {
      flex: 1;
      padding: 1.5rem;
    }

    .ui-header {
      height: 24px;
      background: #f1f5f9;
      border-radius: 4px;
      margin-bottom: 2rem;
      width: 60%;
    }

    .ui-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .ui-card {
      height: 120px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #f1f5f9;
    }

    /* Trusted By */
    .trusted-by {
      padding: 4rem 0;
      border-top: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
      text-align: center;
    }

    .trusted-by p {
      font-size: 0.875rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 2.5rem;
    }

    .logo-grid {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 2rem;
      opacity: 0.5;
    }

    .company-logo {
      font-size: 1.5rem;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.05em;
    }

    /* Features */
    .features {
      padding: 8rem 0;
      background: #f8fafc;
    }

    .section-header {
      text-align: center;
      max-width: 700px;
      margin: 0 auto 5rem;
    }

    .section-header h2 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 1.25rem;
      letter-spacing: -0.025em;
    }

    .section-header p {
      font-size: 1.125rem;
      color: #64748b;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: #fff;
      padding: 2.5rem;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
    }

    .feature-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .feature-icon svg {
      width: 24px;
      height: 24px;
    }

    .icon-blue { background: #f7fee7; color: #84cc16; }
    .icon-green { background: #f0fdf4; color: #22c55e; }
    .icon-purple { background: #f5f3ff; color: #8b5cf6; }
    .icon-orange { background: #fff7ed; color: #f97316; }
    .icon-red { background: #fef2f2; color: #ef4444; }
    .icon-teal { background: #f0fdfa; color: #14b8a6; }

    .feature-card h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .feature-card p {
      color: #64748b;
      line-height: 1.6;
    }

    /* Story Section */
    .story {
      padding: 8rem 0;
      background: #fff;
    }

    .story-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 4rem;
      align-items: start;
    }

    @media (max-width: 1024px) {
      .story-grid {
        grid-template-columns: 1fr;
        gap: 3rem;
      }
    }

    .story-chapter {
      text-align: center;
      padding: 2rem;
      border-radius: 24px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .story-chapter:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
    }

    .chapter-number {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--primary-gradient);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 800;
      margin: 0 auto 2rem;
      box-shadow: 0 10px 15px -3px rgba(132, 204, 22, 0.2);
    }

    .story-chapter h3 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #1e293b;
    }

    .story-chapter p {
      color: #64748b;
      line-height: 1.7;
      font-size: 1rem;
    }

    .story-chapter .emoji {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      display: block;
    }

    /* CTA */
    .cta {
      padding: 6rem 0;
    }

    .cta-box {
      background: #1e293b;
      border-radius: 32px;
      padding: 5rem;
      text-align: center;
      color: #fff;
      position: relative;
      overflow: hidden;
    }

    .cta-box h2 {
      font-size: 3rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      letter-spacing: -0.025em;
    }

    .cta-box p {
      font-size: 1.25rem;
      color: #94a3b8;
      margin-bottom: 3rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .btn-white {
      background: #fff;
      color: #1e293b;
    }

    .btn-white:hover {
      background: #f1f5f9;
    }

    .btn-outline-white {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    .btn-outline-white:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    /* Footer */
    .footer {
      padding: 6rem 0 3rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 4rem;
      margin-bottom: 4rem;
    }

    @media (max-width: 768px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
      }
      .footer-brand {
        grid-column: span 2;
      }
    }

    .footer-brand p {
      margin-top: 1.5rem;
      color: #64748b;
      max-width: 300px;
    }

    .footer-links h4 {
      font-size: 0.875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1.5rem;
      color: #1e293b;
    }

    .footer-links a {
      display: block;
      color: #64748b;
      margin-bottom: 0.75rem;
      transition: color 0.2s;
    }

    .footer-links a:hover {
      color: #3b82f6;
      text-decoration: none;
    }

    .footer-bottom {
      padding-top: 2rem;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 0.875rem;
    }
  `]
})
export class LandingComponent {}
