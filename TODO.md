# PRODUCTION WORKSHOP MODULE — FINAL STABILIZATION

## Backend
- [ ] 1. Add `POST /api/workshop-sessions/:id/recording/start` — starts LiveKit egress, persists `Recording` doc (sessionId, trainerId, startTime, status, recordingId, storageLocation)
- [ ] 2. Enhance `POST /api/workshop-sessions/:id/recording/stop` — perseand `endTime`, `duration`, `videoUrl`, `thumbnail`, `fileSize`, `storageLocation` on `Recording` doc
- [ ] 3. Add admin feedback endpoint `GET /api/workshops/admin/feedback` (all feedback, real DB data, with stats + distribution)
- [ ] 4. Add admin recordings endpoint `GET /api/workshops/admin/recordings` + delete
- [ ] 5. Add admin session endpoint (list all sessions for admin) — already exists via `/api/workshop-sessions`
- [ ] 6. Enhance participant status computation (Registered → Waiting → Joined → Live → Left → Completed)
- [ ] 7. Ensure session end computes attendance + finalizes + emits realtime events (already present, verify/complete)

## Frontend
- [ ] 8. Rewrite Admin `WorkshopFeedback.jsx` to use real MongoDB data (remove mock arrays)
- [ ] 9. Create Admin `WorkshopRecordings.jsx` page (list, play, download, delete, stats, filters)
- [ ] 10. Create Trainer `WorkshopRecordings.jsx` page (list, play, download, delete, search, filters)
- [ ] 11. Wire `LiveRoom.jsx` recording buttons to backend `/recording/start` + `/recording/stop` APIs with real timer + status
- [ ] 12. Add nav items for recordings (Admin + Trainer layouts)
- [ ] 13. Register new routes in `App.jsx`
- [ ] 14. Trainee dashboard completed-session view (Completed, Attendance %, Feedback pending, Certificate eligibility, Join button disappears)
