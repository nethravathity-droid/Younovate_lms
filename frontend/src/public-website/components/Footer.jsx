import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <>
      <style>{CSS}</style>
      <footer className="pw-footer">
        <div className="pw-footer-inner">
          <div className="pw-footer-brand">
            <div className="pw-footer-logo">
              <span className="pw-footer-logo-icon">Y</span>
              <span className="pw-footer-logo-text">YouVA <span>OS</span></span>
            </div>
            <p className="pw-footer-tagline">
              Master Artificial Intelligence through hands-on workshops, industry programs, and real projects.
            </p>
            <div className="pw-footer-socials">
              {[
                { icon: 'ti-brand-linkedin', href: '#' },
                { icon: 'ti-brand-instagram', href: '#' },
                { icon: 'ti-brand-youtube', href: '#' },
                { icon: 'ti-brand-twitter', href: '#' },
              ].map(s => (
                <a key={s.icon} href={s.href} className="pw-social-link" target="_blank" rel="noreferrer">
                  <i className={`ti ${s.icon}`} />
                </a>
              ))}
            </div>
          </div>

          <div className="pw-footer-col">
            <h4>Programs</h4>
            <Link to="/programs">AI Programs</Link>
            <Link to="/programs#yiep">YIEP</Link>
            <Link to="/programs#yblp">YBLP</Link>
            <Link to="/workshops">AI Workshops</Link>
          </div>

          <div className="pw-footer-col">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/about#team">Our Team</Link>
            <Link to="/about#partners">Partners</Link>
          </div>

          <div className="pw-footer-col">
            <h4>Support</h4>
            <Link to="/contact">Help Center</Link>
            <a href="mailto:info@younovate.in">info@younovate.in</a>
            <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer">WhatsApp Us</a>
          </div>
        </div>

        <div className="pw-footer-bottom">
          <span>© {new Date().getFullYear()} YouVA OS by Younovate. All rights reserved.</span>
          <div className="pw-footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </>
  );
}

const CSS = `
  .pw-footer {
    background: #1E293B;
    color: #94A3B8;
    padding: 64px 24px 0;
    margin-top: 80px;
  }
  .pw-footer-inner {
    max-width: 1200px; margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    padding-bottom: 48px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .pw-footer-logo {
    display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
  }
  .pw-footer-logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #1E3A8A, #2563EB);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 800; font-size: 18px;
  }
  .pw-footer-logo-text {
    font-size: 18px; font-weight: 800; color: #F1F5F9;
  }
  .pw-footer-logo-text span { color: #3B82F6; }
  .pw-footer-tagline {
    font-size: 14px; line-height: 1.7; color: #94A3B8; margin-bottom: 20px;
  }
  .pw-footer-socials { display: flex; gap: 10px; }
  .pw-social-link {
    width: 36px; height: 36px; border-radius: 8px;
    background: rgba(255,255,255,0.07);
    display: flex; align-items: center; justify-content: center;
    color: #94A3B8; font-size: 17px; text-decoration: none;
    transition: background 0.2s, color 0.2s;
  }
  .pw-social-link:hover { background: #2563EB; color: #fff; }
  .pw-footer-col h4 {
    font-size: 13px; font-weight: 700; color: #F1F5F9;
    text-transform: uppercase; letter-spacing: 0.8px;
    margin-bottom: 16px;
  }
  .pw-footer-col a {
    display: block; font-size: 14px; color: #94A3B8;
    text-decoration: none; margin-bottom: 10px;
    transition: color 0.2s;
  }
  .pw-footer-col a:hover { color: #F1F5F9; }
  .pw-footer-bottom {
    max-width: 1200px; margin: 0 auto;
    padding: 20px 0;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 13px; color: #64748B;
  }
  .pw-footer-legal { display: flex; gap: 20px; }
  .pw-footer-legal a { color: #64748B; text-decoration: none; transition: color 0.2s; }
  .pw-footer-legal a:hover { color: #F1F5F9; }
  @media (max-width: 900px) {
    .pw-footer-inner { grid-template-columns: 1fr 1fr; gap: 32px; }
  }
  @media (max-width: 560px) {
    .pw-footer-inner { grid-template-columns: 1fr; gap: 28px; }
    .pw-footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
  }
`;
