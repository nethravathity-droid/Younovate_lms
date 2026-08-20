'use strict';

/** Local midnight today. */
function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseDateInput(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return d;
}

/** Calendar date before today (date-only fields). */
function isPastDateOnly(dateInput) {
  const d = parseDateInput(dateInput);
  if (!d) return { invalid: true, past: false };
  const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return { invalid: false, past: dateOnly < startOfToday() };
}

/** Combine YYYY-MM-DD (or Date) with optional HH:mm into local Date. */
function combineDateAndTime(dateInput, timeStr) {
  if (!dateInput) return null;
  if (typeof dateInput === 'string' && dateInput.includes('T') && !timeStr) {
    const dt = new Date(dateInput);
    return isNaN(dt.getTime()) ? null : dt;
  }
  let dateStr = dateInput;
  if (dateInput instanceof Date) {
    const pad = (n) => String(n).padStart(2, '0');
    dateStr = `${dateInput.getFullYear()}-${pad(dateInput.getMonth() + 1)}-${pad(dateInput.getDate())}`;
  } else if (typeof dateInput === 'string') {
    dateStr = dateInput.slice(0, 10);
  }
  const time = (timeStr || '00:00').trim();
  const dt = new Date(`${dateStr}T${time}`);
  return isNaN(dt.getTime()) ? null : dt;
}

/** Full datetime before now. Pass timeStr when date and time are separate fields. */
function isPastDateTime(dateInput, timeStr) {
  const hasTime = timeStr !== undefined && timeStr !== null && String(timeStr).trim() !== '';
  const dt = hasTime ? combineDateAndTime(dateInput, timeStr) : new Date(dateInput);
  if (!dt || isNaN(dt.getTime())) return { invalid: true, past: false };
  return { invalid: false, past: dt < new Date() };
}

function rejectPastDate(dateInput, label = 'Date') {
  const r = isPastDateOnly(dateInput);
  if (r.invalid) return { ok: false, message: `Invalid ${label.toLowerCase()}.` };
  if (r.past) return { ok: false, message: `${label} cannot be in the past.` };
  return { ok: true };
}

function rejectPastDateTime(dateInput, timeStr, label = 'Date/time') {
  const r = isPastDateTime(dateInput, timeStr);
  if (r.invalid) return { ok: false, message: `Invalid ${label.toLowerCase()}.` };
  if (r.past) return { ok: false, message: `${label} cannot be in the past.` };
  return { ok: true };
}

module.exports = {
  startOfToday,
  combineDateAndTime,
  isPastDateOnly,
  isPastDateTime,
  rejectPastDate,
  rejectPastDateTime,
};
