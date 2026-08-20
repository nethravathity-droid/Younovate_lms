// Workshop + shared recording file resolution and disk reconciliation.
'use strict';
const path = require('path');
const fs   = require('fs');

const RECORDINGS_DIR = path.join(__dirname, '..', '..', '..', 'lms-recordings');
const BASE_RECORDING_URL = (process.env.PUBLIC_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeRelPath(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/^\/out\//, '')
    .replace(/^recordings\//, '')
    .replace(/^\/+/, '');
}

function buildRecordingUrl(relPath) {
  if (!relPath) return '';
  return `${BASE_RECORDING_URL}/recordings/${relPath}`;
}

function findLatestMp4InRoom(roomName) {
  if (!roomName) return null;
  const roomDir = path.join(RECORDINGS_DIR, roomName);
  if (!fs.existsSync(roomDir) || !fs.statSync(roomDir).isDirectory()) return null;

  const mp4s = fs.readdirSync(roomDir)
    .filter((f) => f.toLowerCase().endsWith('.mp4'))
    .map((f) => {
      const full = path.join(roomDir, f);
      const stat = fs.statSync(full);
      return { name: f, full, mtime: stat.mtimeMs, size: stat.size };
    })
    .filter((f) => f.size > 0)
    .sort((a, b) => b.mtime - a.mtime);

  return mp4s[0] || null;
}

function resolveRecordingPlayback(recording) {
  let relPath = '';
  let url = recording.url || '';

  if (url) {
    relPath = normalizeRelPath(url.replace(/^https?:\/\/[^/]+/, ''));
  }
  if (!relPath && recording.filename) {
    relPath = normalizeRelPath(recording.filename);
  }
  if (!relPath && recording.roomName) {
    const latest = findLatestMp4InRoom(recording.roomName);
    if (latest) relPath = `${recording.roomName}/${latest.name}`;
  }
  if (relPath) url = buildRecordingUrl(relPath);

  let playable = false;
  if (relPath) {
    const filePath = path.join(RECORDINGS_DIR, relPath);
    playable = fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
  }

  return { url, playable, relPath };
}

/**
 * When Egress finishes (or after stop), match the Recording doc to the real MP4 on disk.
 * Only marks completed when the file physically exists.
 */
async function reconcileRecordingByEgressId(egressId, { maxAttempts = 1, delayMs = 0 } = {}) {
  if (!egressId) return null;

  const Recording = require('../models/Recording');
  const Session   = require('../models/Session');

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0 && delayMs > 0) await sleep(delayMs);

    const recording = await Recording.findOne({ egressId }).lean();
    if (!recording) return null;

    if (recording.status === 'completed' && recording.url) {
      const { playable } = resolveRecordingPlayback(recording);
      if (playable) return recording;
    }

    const latest = findLatestMp4InRoom(recording.roomName);
    if (!latest) continue;

    const relPath = `${recording.roomName}/${latest.name}`;
    const url     = buildRecordingUrl(relPath);
    const endedAt = recording.endedAt || new Date();
    let durationSeconds = recording.durationSeconds || 0;
    if (!durationSeconds && recording.startedAt) {
      durationSeconds = Math.max(1, Math.round((endedAt.getTime() - new Date(recording.startedAt).getTime()) / 1000));
    }

    const updated = await Recording.findOneAndUpdate(
      { egressId },
      {
        $set: {
          status: 'completed',
          url,
          filename: relPath,
          sizeBytes: latest.size,
          endedAt,
          durationSeconds,
          error: '',
        },
      },
      { new: true }
    ).lean();

    if (updated?.sessionId) {
      await Session.findByIdAndUpdate(updated.sessionId, {
        $set: { recordingStatus: 'available', recordingUrl: url },
      });
    }

    return updated;
  }

  return Recording.findOne({ egressId }).lean();
}

module.exports = {
  RECORDINGS_DIR,
  BASE_RECORDING_URL,
  normalizeRelPath,
  buildRecordingUrl,
  findLatestMp4InRoom,
  resolveRecordingPlayback,
  reconcileRecordingByEgressId,
};
