import React, { useMemo, useState } from 'react';
import {
  AI_BOOTUP_DEFAULT,
  DEFAULT_SPEAKERS,
  AI_BOOTUP_MODULE_BUILDER,
  WORKSHOP_MODES,
  WORKSHOP_CATEGORIES,
  WORKSHOP_BILLING,
  WORKSHOP_LANGUAGES,
} from './workshopMockData';

const fmtDuration = (mins) => `${mins} Minutes`;

const defaultForm = {
  // General Information
  workshopTitle: AI_BOOTUP_DEFAULT.title,
  tagline: AI_BOOTUP_DEFAULT.tagline,
  subTheme: AI_BOOTUP_DEFAULT.subTheme,
  category: 'Workshop',

  // Workshop Details
  workshopType: 'Online',
  aiSkills: ['AI Skills', 'Career Readiness', 'Student Productivity'],

  mode: 'Online',
  billing: 'Free',
  date: '',
  time: '10:00 AM',
  registrationDeadline: '',
  maxSeats: 120,
  status: 'Draft',

  bannerUpload: null,
  thumbnailUpload: null,

  description: 'A live workshop/event that helps learners adopt AI for productivity, prompt engineering, and career growth.',
  learningOutcomes: 'By the end of the workshop, participants will be able to build smarter study plans, write stronger prompts, and use AI frameworks for career growth.',
  prerequisites: 'Basic computer literacy and curiosity to learn.',
  language: 'English',

  // Duration
  mainWorkshopMinutes: 90,
  softPromotionMinutes: 10,
  totalEventMinutes: 100,

  // Speaker management
  allowMultipleSpeakers: true,
  speakers: DEFAULT_SPEAKERS,

  // Module builder
  modules: AI_BOOTUP_MODULE_BUILDER,

  // Certificate rule
  certificateRuleAttendancePct: 60,
  certificateRuleFeedbackRequired: true,

  // Feedback settings
  feedbackEnabled: true,

  // Lead capture settings
  leadCaptureEnabled: true,

  // Registration settings
  registrationEnabled: true,
  attendanceEnabled: true,
  certificateEnabled: true,

  // Publish / draft
  publishNow: false,
};

function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <span style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#657691', marginBottom: 6 }}>
          {label}
          {required && <span style={{ color: '#DC2626', marginLeft: 4 }}>*</span>}
        </span>
      )}
      {children}
      {hint && <div style={{ marginTop: 6, fontSize: 12, color: '#94A3B8', fontWeight: 650 }}>{hint}</div>}
    </div>
  );
}

function SmallToggle({ checked, label, onChange, disabled }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span style={{ fontSize: 13, fontWeight: 800, color: '#172033' }}>{label}</span>
    </label>
  );
}

function Section({ title, children, subtitle }) {
  return (
    <div style={section}>
      <div style={sectionHead}>
        <div>
          <h3 style={sectionTitle}>{title}</h3>
          {subtitle && <div style={sectionSub}>{subtitle}</div>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function ModuleBuilder({ modules, setModules }) {
  const [openId, setOpenId] = useState(modules[0]?.moduleId);

  const toggleTopic = (moduleId, topic) => {
    // UI-only: remove topic if exists, otherwise add
    setModules((prev) =>
      prev.map((m) => {
        if (m.moduleId !== moduleId) return m;
        const has = m.topics.includes(topic);
        const nextTopics = has ? m.topics.filter((t) => t !== topic) : [...m.topics, topic];
        return { ...m, topics: nextTopics };
      })
    );
  };

  const addTopic = (moduleId) => {
    const newTopic = 'New Topic';
    setModules((prev) => prev.map((m) => (m.moduleId === moduleId ? { ...m, topics: [...m.topics, newTopic] } : m)));
  };

  const updateTitle = (moduleId, value) => {
    setModules((prev) => prev.map((m) => (m.moduleId === moduleId ? { ...m, title: value } : m)));
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {modules.map((m, idx) => {
        const isOpen = openId === m.moduleId;
        return (
          <div key={m.moduleId} style={{ border: '1px solid #dbe3ed', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : m.moduleId)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: isOpen ? '#f1f7ff' : '#fff',
                border: 'none',
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#94A3B8', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Module {idx + 1}
                </div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#172033', marginTop: 4 }}>{m.title}</div>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 900, color: '#2f6f9b' }}>{fmtDuration(m.durationMinutes)}</div>
            </button>

            {isOpen && (
              <div style={{ padding: 14, display: 'grid', gap: 10 }}>
                <Field label="Assigned Module title">
                  <input value={m.title} onChange={(e) => updateTitle(m.moduleId, e.target.value)} style={input} />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Field label="Duration (minutes)">
                    <input
                      type="number"
                      min={1}
                      value={m.durationMinutes}
                      onChange={(e) => {
                        const v = Number(e.target.value || 0);
                        setModules((prev) => prev.map((mm) => (mm.moduleId === m.moduleId ? { ...mm, durationMinutes: v } : mm)));
                      }}
                      style={input}
                    />
                  </Field>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button type="button" style={btnGhost} onClick={() => addTopic(m.moduleId)}>
                      + Add Topic
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#657691', letterSpacing: '0.7px', textTransform: 'uppercase' }}>Topics</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {m.topics.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTopic(m.moduleId, t)}
                        style={topicPill(t, true)}
                        title="Click to remove topic"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#94A3B8', fontWeight: 700 }}>UI-only: click a topic pill to remove it. Add Topic adds “New Topic”.</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function topicPill(text) {
  return {
    border: '1px solid #dbe3ed',
    background: '#f8fafc',
    padding: '8px 10px',
    borderRadius: 999,
    fontSize: 12.5,
    fontWeight: 900,
    color: '#172033',
    cursor: 'pointer',
  };
}

export default function CreateWorkshop() {
  const [form, setForm] = useState(defaultForm);

  const speakers = form.speakers || [];

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const totalEvent = (form.mainWorkshopMinutes || 0) + (form.softPromotionMinutes || 0);

  const aiBootupPrefill = () => {
    setForm((f) => ({
      ...f,
      workshopTitle: AI_BOOTUP_DEFAULT.title,
      tagline: AI_BOOTUP_DEFAULT.tagline,
      subTheme: AI_BOOTUP_DEFAULT.subTheme,
      category: 'Workshop',
      mode: 'Online',
      workshopType: 'Online',
      billing: 'Free',
      mainWorkshopMinutes: 90,
      softPromotionMinutes: 10,
      totalEventMinutes: 100,
      speakers: DEFAULT_SPEAKERS,
      modules: AI_BOOTUP_MODULE_BUILDER,
      description:
        'A live workshop/event that helps learners adopt AI for productivity, prompt engineering, and career growth.',
      learningOutcomes:
        'By the end of the workshop, participants will be able to build smarter study plans, write stronger prompts, and use AI frameworks for career growth.',
      prerequisites: 'Basic computer literacy and curiosity to learn.',
    }));
  };

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h2 style={title}>Create Workshop</h2>
          <p style={sub}>Complete mock form • AI Boot-Up prefilled • No backend APIs yet.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" style={btnGhost} onClick={aiBootupPrefill}>
            Prefill AI Boot-Up
          </button>
          <button type="button" style={btnPrimary} onClick={() => {}}>
            Save (UI only)
          </button>
        </div>
      </div>

      <Section title="General Information" subtitle="Core identity and experience." >
        <div style={grid2}>
          <Field label="Workshop Name" required>
            <input style={input} value={form.workshopTitle} onChange={(e) => set('workshopTitle', e.target.value)} />
          </Field>
          <Field label="Category" required>
            <select style={input} value={form.category} onChange={(e) => set('category', e.target.value)}>
              {WORKSHOP_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <div style={grid2}>
          <Field label="Tagline">
            <input style={input} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </Field>
          <Field label="Sub Theme">
            <input style={input} value={form.subTheme} onChange={(e) => set('subTheme', e.target.value)} />
          </Field>
        </div>

        <div style={grid2}>
          <Field label="Workshop Language">
            <select style={input} value={form.language} onChange={(e) => set('language', e.target.value)}>
              {WORKSHOP_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select style={input} value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </Field>
        </div>

        <Field label="Description">
          <textarea style={{ ...input, minHeight: 96, resize: 'vertical' }} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </Field>

        <div style={grid2}>
          <Field label="Banner" hint="UI-only">
            <input type="file" onChange={(e) => set('bannerUpload', e.target.files?.[0] || null)} />
          </Field>
          <Field label="Thumbnail" hint="UI-only">
            <input type="file" onChange={(e) => set('thumbnailUpload', e.target.files?.[0] || null)} />
          </Field>
        </div>
      </Section>

      <Section title="Workshop Details" subtitle="Date, time, seat limits and description." >
        <div style={grid2}>
          <Field label="Mode">
            <select style={input} value={form.mode} onChange={(e) => set('mode', e.target.value)}>
              {WORKSHOP_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Free / Paid">
            <select style={input} value={form.billing} onChange={(e) => set('billing', e.target.value)}>
              {['Free', 'Paid'].map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
        </div>

        <div style={grid2}>
          <Field label="Date">
            <input type="date" style={input} value={form.date} onChange={(e) => set('date', e.target.value)} />
          </Field>
          <Field label="Time">
            <input style={input} value={form.time} onChange={(e) => set('time', e.target.value)} />
          </Field>
        </div>

        <div style={grid2}>
          <Field label="Registration Deadline">
            <input type="date" style={input} value={form.registrationDeadline} onChange={(e) => set('registrationDeadline', e.target.value)} />
          </Field>
          <Field label="Maximum Seats" required hint="Positive whole number (no decimals, no leading zeros).">
            {(() => {
              const raw = form.maxSeats;
              const s = raw === null || raw === undefined ? String(raw) : String(raw);
              const trimmed = s.trim();
              let err = null;
              if (trimmed === 'null' || trimmed === 'undefined') err = 'Maximum seats is required.';
              else if (trimmed === '') err = 'Maximum seats is required.';
              else if (!/^[1-9]\d*$/.test(trimmed)) err = 'Maximum seats must be a positive whole number.';


              const showInvalid = err != null;
              return (
                <>
                  <input
                    type="text"
                    inputMode="numeric"
                    style={{ ...input, borderColor: showInvalid ? '#fca5a5' : '#dbe3ed' }}
                    value={form.maxSeats === undefined ? '' : String(form.maxSeats)}
                    onChange={(e) => {
                      // Store raw string to allow exact validation rules (no reliance on input type)
                      set('maxSeats', e.target.value);
                    }}
                    onBlur={() => {
                      // Optional: normalize when valid
                      const t = String(form.maxSeats ?? '').trim();
                      if (/^[1-9]\d*$/.test(t)) set('maxSeats', Number(t));
                    }}
                    onKeyDown={(e) => {
                      // Prevent spaces from being entered
                      if (e.key === ' ') e.preventDefault();
                    }}
                  />
                  {showInvalid && (
                    <div style={{ marginTop: 6, fontSize: 12, color: '#DC2626', fontWeight: 750 }}>{err}</div>
                  )}
                </>
              );
            })()}
          </Field>

        </div>

        <Field label="Workshop Banner Upload" hint="UI-only: file selection only.">
          <input type="file" onChange={(e) => set('bannerUpload', e.target.files?.[0] || null)} />
        </Field>

        <Field label="Thumbnail Upload" hint="UI-only: file selection only.">
          <input type="file" onChange={(e) => set('thumbnailUpload', e.target.files?.[0] || null)} />
        </Field>

        <Field label="Description">
          <textarea style={{ ...input, minHeight: 96, resize: 'vertical' }} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </Field>

        <Field label="Learning Outcomes">
          <textarea style={{ ...input, minHeight: 80, resize: 'vertical' }} value={form.learningOutcomes} onChange={(e) => set('learningOutcomes', e.target.value)} />
        </Field>

        <Field label="Prerequisites">
          <textarea style={{ ...input, minHeight: 70, resize: 'vertical' }} value={form.prerequisites} onChange={(e) => set('prerequisites', e.target.value)} />
        </Field>
      </Section>

      <Section title="Duration" subtitle="Main workshop + soft promotion." >
        <div style={grid2}>
          <Field label="Main Workshop Duration">
            <input
              type="number"
              min={0}
              style={input}
              value={form.mainWorkshopMinutes}
              onChange={(e) => set('mainWorkshopMinutes', Number(e.target.value))}
            />
          </Field>
          <Field label="Soft Promotion Duration">
            <input
              type="number"
              min={0}
              style={input}
              value={form.softPromotionMinutes}
              onChange={(e) => set('softPromotionMinutes', Number(e.target.value))}
            />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={miniStat}>Total Event: <b>{totalEvent}</b> Minutes</div>
        </div>
      </Section>

      <Section title="Speaker Management" subtitle="Allow multiple speakers and assign timings." >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <SmallToggle
            checked={form.allowMultipleSpeakers}
            label="Allow Multiple Speakers"
            onChange={(v) => set('allowMultipleSpeakers', v)}
          />
          <button type="button" style={btnGhost} onClick={() => {
            set('speakers', [...speakers, { name: 'New Speaker', photo: '', designation: '', bio: '', linkedIn: '', timing: { module: 'Module 1', durationMinutes: 10 } }]);
          }}>
            + Add Speaker
          </button>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {speakers.map((s, idx) => (
            <div key={`${s.name}-${idx}`} style={speakerCard}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Name">
                  <input style={input} value={s.name} onChange={(e) => {
                    const next = speakers.map((sp, i) => i === idx ? { ...sp, name: e.target.value } : sp);
                    set('speakers', next);
                  }} />
                </Field>
                <Field label="Designation">
                  <input style={input} value={s.designation} onChange={(e) => {
                    const next = speakers.map((sp, i) => i === idx ? { ...sp, designation: e.target.value } : sp);
                    set('speakers', next);
                  }} />
                </Field>
              </div>

              <div style={grid2}>
                <Field label="Bio">
                  <textarea style={{ ...input, minHeight: 66, resize: 'vertical' }} value={s.bio} onChange={(e) => {
                    const next = speakers.map((sp, i) => i === idx ? { ...sp, bio: e.target.value } : sp);
                    set('speakers', next);
                  }} />
                </Field>
                <Field label="LinkedIn">
                  <input style={input} value={s.linkedIn} onChange={(e) => {
                    const next = speakers.map((sp, i) => i === idx ? { ...sp, linkedIn: e.target.value } : sp);
                    set('speakers', next);
                  }} />
                </Field>
              </div>

              <div style={grid2}>
                <Field label="Assigned Module">
                  <select style={input} value={s.timing?.module || 'Module 1'} onChange={(e) => {
                    const next = speakers.map((sp, i) => i === idx ? { ...sp, timing: { ...(sp.timing || {}), module: e.target.value } } : sp);
                    set('speakers', next);
                  }}>
                    {['Module 1', 'Module 2', 'Module 3', 'Module 4'].map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Field>
                <Field label="Session Timing (minutes)">
                  <input type="number" min={0} style={input} value={s.timing?.durationMinutes || 0} onChange={(e) => {
                    const next = speakers.map((sp, i) => i === idx ? { ...sp, timing: { ...(sp.timing || {}), durationMinutes: Number(e.target.value) } } : sp);
                    set('speakers', next);
                  }} />
                </Field>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" style={{ ...btnGhost, borderColor: '#fecaca', color: '#DC2626' }} onClick={() => {
                  set('speakers', speakers.filter((_, i) => i !== idx));
                }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Module Builder" subtitle="Collapsible modules. Click to expand. Topics editable (UI-only)." >
        <ModuleBuilder modules={form.modules} setModules={(fn) => set('modules', fn(form.modules))} />
      </Section>

      <Section title="Certificate Rule" subtitle="Eligibility requires Attendance ≥ 60% AND Feedback Submitted." >
        <div style={grid2}>
          <Field label="Minimum Attendance %">
            <input
              type="number"
              style={input}
              min={0}
              value={form.certificateRuleAttendancePct}
              onChange={(e) => set('certificateRuleAttendancePct', Number(e.target.value))}
            />
          </Field>
          <Field label="Feedback Required">
            <SmallToggle checked={form.certificateRuleFeedbackRequired} label="Feedback submitted" onChange={(v) => set('certificateRuleFeedbackRequired', v)} />
          </Field>
        </div>
      </Section>

      <Section title="Feedback Settings" subtitle="Enable/disable feedback for workshops." >
        <SmallToggle checked={form.feedbackEnabled} label="Feedback ON" onChange={(v) => set('feedbackEnabled', v)} />
      </Section>

      <Section title="Lead Capture Settings" subtitle="Capture post-workshop interest." >
        <SmallToggle checked={form.leadCaptureEnabled} label="Lead Capture ON" onChange={(v) => set('leadCaptureEnabled', v)} />
      </Section>

      <Section title="Publish / Draft" subtitle="UI-only publish action. No backend APIs yet." >
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" style={btnPrimary} onClick={() => set('publishNow', true)}>
            Publish
          </button>
          <button type="button" style={btnGhost} onClick={() => set('status', 'Draft')}>
            Save as Draft
          </button>
          <div style={{ fontSize: 12.5, color: '#94A3B8', fontWeight: 750 }}>
            Current status: <b style={{ color: '#172033' }}>{form.status}</b>
          </div>
        </div>
      </Section>
    </div>
  );
}

const page = { padding: '24px 24px 40px', fontFamily: 'Public Sans, system-ui, sans-serif', background: '#f1f5f9', minHeight: '100vh' };
const header = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 14 };
const title = { margin: 0, fontSize: 22, fontWeight: 900, color: '#172033' };
const sub = { margin: '6px 0 0', color: '#657691', fontWeight: 700, fontSize: 13 };

const section = { background: '#fff', border: '1px solid #dbe3ed', borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: '0 1px 2px rgba(23,32,51,.06)' };
const sectionHead = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 10 };
const sectionTitle = { margin: 0, fontSize: 14.5, fontWeight: 950, color: '#0F172A' };
const sectionSub = { marginTop: 4, fontSize: 12.5, color: '#94A3B8', fontWeight: 750 };

const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 };
const input = { width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: 10, border: '1px solid #dbe3ed', fontSize: 13, fontFamily: 'inherit', color: '#172033', background: '#fff' };

const btnPrimary = { background: '#2f6f9b', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, fontSize: 13.5, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' };
const btnGhost = { background: '#fff', color: '#41506a', border: '1px solid #dbe3ed', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 900, fontSize: 13, fontFamily: 'inherit' };

const speakerCard = { border: '1px solid #dbe3ed', borderRadius: 12, padding: 14, background: '#f8fafc' };
const miniStat = { border: '1px solid #dbe3ed', background: '#fff', padding: '12px 14px', borderRadius: 12, fontWeight: 900, color: '#172033' };

