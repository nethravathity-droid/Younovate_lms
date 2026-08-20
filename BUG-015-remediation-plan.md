# BUG-015: Past Date/Time Validation — Remediation Plan

## Status: COMPLETE ANALYSIS — 7 fixes needed

## Context

BUG-015 requires ensuring that no entity can be created or edited with a past date/time.
The codebase has inconsistent past-date validation across 4 entity types:
- **LMS Session** (scheduledAt)
- **Batch** (startDate)
- **Workshop** (date)
- **Workshop Batch** (startDate)
- **Workshop Live Session** (scheduledAt)

## Server.js Route Mount Points (source of truth)

| Mount Path | Route File | Entities Served |
|---|---|---|
| `/api/sessions` | `sessionRoutes.js` | Admin LMS sessions |
| `/api/trainer` | `trainerRoutes.js` | Trainer LMS sessions |
| `/api/batches` | `batchRoutes.js` | LMS batches (admin CRUD) |
| `/api/admin` | `adminRoutes.js` | Admin batches (alt endpoint) |
| `/api/workshops` | `workshopRoutes.js` | Workshops + Workshop batches |
| `/api/workshop-sessions` | `workshopSessionRoutes.js` | Workshop live sessions |

Note: `sessions.js` is NOT imported in `server.js` — it is dead/legacy code. Do not modify.

---

## Already Covered (No Changes Needed)

### Backend — Has past-date validation
| Route File | Endpoint | Field | Validation Lines |
|---|---|---|---|
| `sessionRoutes.js` | POST `/api/sessions` | `scheduledAt` | 57-58 |
| `sessionRoutes.js` | PUT `/api/sessions/:id` | `scheduledAt` | 75-76 |
| `trainerRoutes.js` | POST `/api/trainer/sessions` | `scheduledAt` | 126-127 |
| `trainerRoutes.js` | PUT `/api/trainer/sessions/:id` | `scheduledAt` | 171-172 |
| `workshopRoutes.js` | POST `/api/workshops` | `date` | 992-1001 (date-only) |
| `workshopRoutes.js` | PUT `/api/workshops/:id` | `date` | 1109-1119 (date-only) |
| `workshopSessionRoutes.js` | POST `/api/workshop-sessions` | `scheduledAt` | 92-94 |
| `workshopSessionRoutes.js` | PUT `/api/workshop-sessions/:id` | `scheduledAt` | 172-174 |

### Frontend — Has past-date validation
| Page | Validation Approach |
|---|---|
| `admin/Sessions.jsx` | Line 219: `if (scheduledDate < new Date()) return setFormError(...)`. Line 537: `min={minDateTime()}` |
| `trainer/Sessions.jsx` | Lines 596-661: `isPastDateTime()`, `todayDateInput()`, `nowTimeInput()` |
| `trainer/SessionDetail.jsx` | Line 286: `isPastDateTime()` + `todayDateInput()`/`nowTimeInput()` constraints |
| `admin/workshops/WorkshopManagement.jsx` | Lines 100-106: `if (selected < today) { alert(...) }`. Line 176: `min` attribute |
| `admin/workshops/LiveSessions.jsx` | Lines 101-106: `if (local < now) { alert(...) }`. Line 137: `min` attribute |

---

## Fixes Required

### Fix 1: `batchRoutes.js` — Backend LMS Batch validation
**File:** `backend\src\routes\batchRoutes.js`
**Endpoints:** POST `/` (line 78), PUT `/:id` (line 88)

**Problem:** Both handlers pass `req.body` directly to Mongoose with no date validation.

**Fix (POST, after line 79):**
```js
// After Batch.create(req.body), before return — actually validate BEFORE create:
// Insert before line 80 (Batch.create):
if (req.body.startDate) {
  const sd = new Date(req.body.startDate);
  if (isNaN(sd.getTime())) return res.status(400).json({ success: false, message: 'Invalid start date.' });
  if (sd < new Date()) return res.status(400).json({ success: false, message: 'Batch start date cannot be in the past.' });
}
```

**Fix (PUT, before line 90):**
```js
// Insert before findByIdAndUpdate:
if (req.body.startDate) {
  const sd = new Date(req.body.startDate);
  if (isNaN(sd.getTime())) return res.status(400).json({ success: false, message: 'Invalid start date.' });
  if (sd < new Date()) return res.status(400).json({ success: false, message: 'Batch start date cannot be in the past.' });
}
```

### Fix 2: `adminRoutes.js` — Backend Admin Batch (alt) validation
**File:** `backend\src\routes\adminRoutes.js`
**Endpoints:** POST `/batches` (line 278), PUT `/batches/:id` (line 285)

**Problem:** Same as Fix 1 — `Batch.create(req.body)` and `Batch.findByIdAndUpdate` with no date validation.

**Fix (POST, after line 280 checks):**
```js
// After the name/startDate presence check (line 280), before Batch.create (line 281):
const sd = new Date(startDate);
if (isNaN(sd.getTime())) return res.status(400).json({ success: false, message: 'Invalid start date.' });
if (sd < new Date()) return res.status(400).json({ success: false, message: 'Batch start date cannot be in the past.' });
```

**Fix (PUT, before line 287):**
```js
// Before findByIdAndUpdate:
if (req.body.startDate) {
  const sd = new Date(req.body.startDate);
  if (isNaN(sd.getTime())) return res.status(400).json({ success: false, message: 'Invalid start date.' });
  if (sd < new Date()) return res.status(400).json({ success: false, message: 'Batch start date cannot be in the past.' });
}
```

### Fix 3: `workshopRoutes.js` — Backend Workshop Batch validation
**File:** `backend\src\routes\workshopRoutes.js`
**Endpoints:** POST `/batches` (line 765), PUT `/batches/:batchId` (line 920)

**Problem:** POST handler validates end-before-start (line 782) but NOT past-dates. PUT handler validates end-before-start (line 925) but NOT past-dates.

**Fix (POST, after line 778 `Invalid start date` check):**
```js
// After line 778, before line 779 (endDate check):
if (sd < new Date()) {
  return res.status(400).json({ success: false, message: 'Batch start date cannot be in the past.' });
}
```

**Fix (PUT, after line 923 destructuring, before line 925 end-before-start check):**
```js
// After line 923, before line 925:
if (startDate) {
  const sd = new Date(startDate);
  if (isNaN(sd.getTime())) return res.status(400).json({ success: false, message: 'Invalid start date.' });
  if (sd < new Date()) return res.status(400).json({ success: false, message: 'Batch start date cannot be in the past.' });
}
```
Note: The PUT handler only destructures `startDate` from `req.body` (line 923), so only validate if provided. Also need to add `startDate` to the `$set` update or ensure it's passed through. Currently line 962 does `{ $set: req.body }`, so `startDate` will be included if sent.

### Fix 4: `admin/Batches.jsx` — Frontend Batch form validation
**File:** `frontend\src\pages\admin\Batches.jsx`
**Component:** `BatchFormModal` (line 194)

**Problem:** Start Date input (line 285) has no `min` attribute; `handleSubmit` (line 227) has no past-date check.

**Fix (line 285 — add `min` attribute):**
```jsx
<FInput label="Start Date" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} min={new Date().toISOString().split('T')[0]} />
```

**Fix (handleSubmit, before line 227 payload construction):**
```js
// Add after line 228 (e.preventDefault()), before line 229:
if (form.startDate) {
  const sd = new Date(form.startDate);
  if (isNaN(sd.getTime())) { setFormError('Invalid start date.'); return; }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (sd < today) { setFormError('Batch start date cannot be in the past.'); return; }
}
```
Also need to ensure `setFormError` is available in the component scope (check if it's imported).

### Fix 5: `admin/workshops/WorkshopRegistrations.jsx` — Frontend Workshop Batch validation
**File:** `frontend\src\pages\admin\workshops\WorkshopRegistrations.jsx`
**Function:** `validateBatchPayload()` (line 247)

**Problem:** The validator checks end-before-start, time format, capacity, but does NOT check if `startDate` is in the past.

**Fix (in `validateBatchPayload()`, after line 250 `if (!form.startDate) return 'Start date is required.'`):**
```js
// Add after line 250:
const startDateCheck = new Date(form.startDate);
if (isNaN(startDateCheck.getTime())) return 'Invalid start date.';
const today = new Date();
today.setHours(0, 0, 0, 0);
if (startDateCheck < today) return 'Start date cannot be in the past.';
```

**Fix (date inputs — lines 573, 577 — add `min` attribute):**
```jsx
<input style={S.input} type="date" value={form.startDate} onChange={...} min={new Date().toISOString().split('T')[0]} />
<input style={S.input} type="date" value={form.endDate} onChange={...} min={form.startDate || new Date().toISOString().split('T')[0]} />
```

---

## Implementation Notes

- Use the **existing validation pattern** from `sessionRoutes.js` lines 54-58 as the template for backend fixes
- Use the **existing frontend pattern** from `admin/Sessions.jsx` lines 217-219 as the template for frontend fixes
- The shared utility `isPastDateTime()` in `frontend/src/utils/dateTime.js` is available for frontend use (handles separate date + time strings)
- For date-only inputs (batch/workshop), use `new Date().toISOString().split('T')[0]` as the `min` attribute (simpler than importing from dateTime.js)
- `CreateWorkshop.jsx` is a UI-only mock (no backend dispatch) — skip unless time permits
- `sessions.js` is dead code (not mounted in server.js) — do not modify
