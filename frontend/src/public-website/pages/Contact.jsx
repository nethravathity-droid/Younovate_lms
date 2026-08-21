import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SectionShell from '../components/SectionShell';
import { youvaTheme } from '../components/youvaTokens';
import PageHeading from '../components/PageHeading';
import FAQ from '../components/FAQ';

export default function Contact() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  const faqItems = [
    {
      q: 'How do I choose between workshops and programs?',
      a: 'Use workshops to learn and practice specific AI workflows quickly. Use YIEP or YBLP programs to convert those skills into structured projects, assessments, certificates, and placement readiness support.',
    },
    {
      q: 'Do you support colleges and corporate cohorts?',
      a: 'Yes. We collaborate with partner institutions to deliver AI cohorts with workshops, program modules, mentorship, and career outcomes.',
    },
    {
      q: 'How soon will I hear back?',
      a: 'Typical response time is within 24–48 hours during business hours. For urgent queries, use WhatsApp.',
    },
  ];

  return (
    <div style={{ background: youvaTheme.colors.bg, paddingBottom: 90 }}>
      <section style={{ paddingTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <PageHeading
            eyebrow="CONTACT"
            title="Talk to YouVA OS"
            description="Reach out to our team. We’ll help you pick the right AI program track (YIEP / YBLP) or the best upcoming workshop." 
          />
        </div>
      </section>

      <SectionShell paddingY={22} paddingBottom={24}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.95fr', gap: 16 }}>
          <form
            onSubmit={submit}
            style={{ borderRadius: 22, background: '#FFFFFF', border: `1px solid ${youvaTheme.colors.borderSoft}`, padding: 18, boxShadow: youvaTheme.shadow.soft }}
          >
            <div style={{ fontSize: 14, fontWeight: 1000, color: youvaTheme.colors.text }}>Contact Form</div>
            <div style={{ marginTop: 10, color: youvaTheme.colors.muted, fontWeight: 850, lineHeight: 1.9 }}>
              Tell us what you want to build. We’ll route your request to the right team (workshop, programs, or partners).
            </div>

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 950, color: youvaTheme.colors.muted }}>Full Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  style={{ borderRadius: 14, border: `1.5px solid ${youvaTheme.colors.borderSoft}`, padding: '12px 14px', outline: 'none', background: '#fff', color: youvaTheme.colors.text, fontWeight: 800 }}
                  placeholder="Your name"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 950, color: youvaTheme.colors.muted }}>Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  style={{ borderRadius: 14, border: `1.5px solid ${youvaTheme.colors.borderSoft}`, padding: '12px 14px', outline: 'none', background: '#fff', color: youvaTheme.colors.text, fontWeight: 800 }}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 950, color: youvaTheme.colors.muted }}>Message</label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                style={{ borderRadius: 14, border: `1.5px solid ${youvaTheme.colors.borderSoft}`, padding: '12px 14px', outline: 'none', background: '#fff', color: youvaTheme.colors.text, fontWeight: 800, resize: 'vertical' }}
                placeholder="Example: I want to learn GenAI and build a portfolio project. Which track should I choose?"
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: 16,
                width: '100%',
                padding: '12px 14px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg,#1E3A8A,#2563EB)',
                color: '#fff',
                fontWeight: 1000,
                cursor: 'pointer',
                opacity: sent ? 0.7 : 1,
              }}
              disabled={sent}
            >
              {sent ? 'Message Sent!' : 'Send Message'}
            </button>

            <div style={{ marginTop: 12, color: youvaTheme.colors.muted, fontWeight: 850, lineHeight: 1.8, fontSize: 13 }}>
              By submitting, you agree to our Terms & Privacy Policy.
            </div>
          </form>

          <div>
            <div style={{ borderRadius: 22, background: youvaTheme.colors.footer, padding: 18, color: '#dbe3ed', boxShadow: youvaTheme.shadow.deep, border: '1px solid rgba(255,255,255,0.10)' }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 1000 }}>Office Address</div>
              <div style={{ marginTop: 10, lineHeight: 1.9, fontWeight: 850, color: '#a9bad0' }}>
                Younovate • India<br />
                <span style={{ color: '#dbe3ed' }}>Email:</span> info@younovate.in<br />
                <span style={{ color: '#dbe3ed' }}>Phone:</span> +91 99999 99999
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 1000 }}>WhatsApp & Support</div>
                <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                  <a
                    href="https://wa.me/919999999999"
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', textDecoration: 'none', padding: '12px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontWeight: 950 }}
                  >
                    <span>
                      <span style={{ display: 'block', fontSize: 13 }}>WhatsApp</span>
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#a9bad0', marginTop: 3 }}>Fast replies</span>
                    </span>
                    <span style={{ color: youvaTheme.colors.brand2 }}>→</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => navigate('/contact')}
                    style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', textDecoration: 'none', padding: '12px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontWeight: 950, width: '100%', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                  >
                    <span>
                      <span style={{ display: 'block', fontSize: 13 }}>Help Center</span>
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#a9bad0', marginTop: 3 }}>FAQs & support</span>
                    </span>
                    <span style={{ color: youvaTheme.colors.accent }}>→</span>
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 1000 }}>Business Hours</div>
                <div style={{ marginTop: 10, color: '#a9bad0', fontWeight: 850, lineHeight: 1.8 }}>
                  Mon–Fri: 10:00 AM – 7:00 PM<br />
                  Sat: 10:00 AM – 2:00 PM<br />
                  Sun: Closed
                </div>
              </div>

              <div style={{ marginTop: 16, borderRadius: 18, border: '1px dashed rgba(255,255,255,0.22)', padding: 14, background: 'rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 13, fontWeight: 1000, color: '#fff' }}>Google Maps</div>
                <div style={{ marginTop: 8, fontSize: 12, fontWeight: 800, color: '#7a8ba4' }}>
                  Map embed section (configured by deployment team).
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['LinkedIn', 'YouTube', 'Instagram'].map((label) => (
                  <span
                    key={label}
                    style={{ color: '#dbe3ed', fontWeight: 950, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '10px 12px', background: 'rgba(255,255,255,0.06)' }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 1000, letterSpacing: '0.08em', color: youvaTheme.colors.accent, textTransform: 'uppercase' }}>Quick FAQs</div>
              <div style={{ marginTop: 10 }}>
                <FAQ items={faqItems} />
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}


