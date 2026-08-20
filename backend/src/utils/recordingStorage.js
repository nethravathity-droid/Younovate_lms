// Workshop + shared recording file resolution and disk reconciliation.
'use strict';
const path = require('path');
const fs   = require('fs');
const { execSync } = require('child_process');

const RECORDINGS_DIR = path.join(__dirname, '..', '..', '..', 'lms-recordings');
const BASE_RECORDING_URL = (process.env.PUBLIC_API_URL || 'http://localhost:8080').replace(/\/+$/, '');
const EGRESS_CONTAINER = process.env.EGRESS_CONTAINER || 'lms-livekit-egress-1';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeRelPath(raw) {
  if (!raw) return '';
  let p = String(raw)
    .replace(/^\/out\//, '')
    .replace(/^\/+/, '');
  // Strip accidental duplicate "recordings/" prefixes from stored URLs.
  while (p.startsWith('recordings/')) {
    p = p.slice('recordings/'.length);
  }
  return p;
}

function buildRecordingUrl(relPath) {
  if (!relPath) return '';
  return `${BASE_RECORDING_URL}/recordings/${relPath}`;
}

function findLatestMp4InRoom(roomName) {
  if (!roomName) return null;
  const roomDir = path.join(RECORDINGS_DIR, roomName);
  if (fs.existsSync(roomDir) && fs.statSync(roomDir).isDirectory()) {
    const mp4s = fs.readdirSync(roomDir)
      .filter((f) => f.toLowerCase().endsWith('.mp4'))
      .map((f) => {
        const full = path.join(roomDir, f);
        const stat = fs.statSync(full);
        return { name: f, full, mtime: stat.mtimeMs, size: stat.size };
      })
      .filter((f) => f.size > 0)
      .sort((a, b) => b.mtime - a.mtime);
    if (mp4s[0]) return mp4s[0];
  }

  // Dev fallback: egress may write inside Docker before the bind mount syncs on Windows.
  try {
    const listed = execSync(
      `docker exec ${EGRESS_CONTAINER} sh -c "ls -1t /out/${roomName}/*.mp4 2>/dev/null"`,
      { encoding: 'utf8', timeout: 15000, windowsHide: true }
    ).trim().split(/\r?\n/).filter(Boolean);
    const latestDocker = listed[0];
    if (!latestDocker) return null;
    const name = path.basename(latestDocker);
    const relPath = `${roomName}/${name}`;
    if (!ensureFileOnHost(relPath)) return null;
    const full = path.join(RECORDINGS_DIR, relPath);
    const stat = fs.statSync(full);
    return { name, full, mtime: stat.mtimeMs, size: stat.size };
  } catch (_) {
    return null;
  }
}

function trySyncFromEgress(relPath) {
  if (!relPath) return false;
  const hostPath = path.join(RECORDINGS_DIR, relPath);
  const hostDir = path.dirname(hostPath);
  try {
    if (!fs.existsSync(hostDir)) fs.mkdirSync(hostDir, { recursive: true });
    const dockerPath = `/out/${relPath.replace(/\\/g, '/')}`;
    execSync(`docker cp "${EGRESS_CONTAINER}:${dockerPath}" "${hostPath}"`, {
      stdio: 'ignore',
      timeout: 60000,
      windowsHide: true,
    });
  } catch (_) {
    return false;
  }
  return fs.existsSync(hostPath) && fs.statSync(hostPath).size > 0;
}

function ensureFileOnHost(relPath) {
  if (!relPath) return false;
  if (fileExistsForRelPath(relPath)) return true;
  return trySyncFromEgress(relPath);
}

function relPathFromStartedAt(roomName, startedAt) {
  if (!roomName || !startedAt) return '';
  const d = new Date(startedAt);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
  const relPath = `${roomName}/${stamp}.mp4`;
  return ensureFileOnHost(relPath) ? relPath : '';
}

function resolveRelPathFromEgressMeta(egressId, roomName) {
  if (!egressId || !roomName) return '';

  const hostJson = path.join(RECORDINGS_DIR, roomName, `${egressId}.json`);
  if (fs.existsSync(hostJson)) {
    try {
      const data = JSON.parse(fs.readFileSync(hostJson, 'utf8'));
      const f = data.files?.[0]?.filename || data.files?.[0]?.location || '';
      if (f) return normalizeRelPath(f);
    } catch (_) {}
  }

  try {
    const raw = execSync(
      `docker exec ${EGRESS_CONTAINER} cat /out/${roomName}/${egressId}.json`,
      { encoding: 'utf8', timeout: 10000, windowsHide: true }
    );
    const data = JSON.parse(raw);
    const f = data.files?.[0]?.filename || data.files?.[0]?.location || '';
    return normalizeRelPath(f);
  } catch (_) {
    return '';
  }
}

function resolveRelPath(recording) {
  if (recording.egressId && recording.roomName) {
    const fromEgress = resolveRelPathFromEgressMeta(recording.egressId, recording.roomName);
    if (fromEgress) return fromEgress;
  }

  if (recording.roomName && recording.startedAt) {
    const fromTime = relPathFromStartedAt(recording.roomName, recording.startedAt);
    if (fromTime) return fromTime;
  }

  let relPath = '';
  if (recording.url) {
    relPath = normalizeRelPath(recording.url.replace(/^https?:\/\/[^/]+/, ''));
  }
  if (!relPath && recording.filename) {
    relPath = normalizeRelPath(recording.filename);
  }
  return relPath;
}

function fileExistsForRelPath(relPath) {
  if (!relPath) return false;
  const filePath = path.join(RECORDINGS_DIR, relPath);
  return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
}

function mp4AtomPositions(filePath) {
  const buf = fs.readFileSync(filePath);
  return {
    size: buf.length,
    moov: buf.indexOf(Buffer.from('moov')),
    mdat: buf.indexOf(Buffer.from('mdat')),
  };
}

function mp4NeedsFastStart(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const { moov, mdat, size } = mp4AtomPositions(filePath);
  if (size < 1024 || moov < 0 || mdat < 0) return false;
  return moov > mdat;
}

function applyMp4FastStart(filePath) {
  const { execSync } = require('child_process');
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const temp = `_faststart_${base}`;
  const mount = dir.replace(/\\/g, '/');

  const localOut = filePath + '.faststart.mp4';
  try {
    execSync(
      `"${process.env.FFMPEG_PATH || 'ffmpeg'}" -y -i "${filePath}" -c copy -movflags +faststart "${localOut}"`,
      { stdio: 'ignore', timeout: 120000, windowsHide: true }
    );
    if (fs.existsSync(localOut) && fs.statSync(localOut).size > 0) {
      fs.renameSync(localOut, filePath);
      return true;
    }
  } catch (_) {}

  try {
    execSync(
      `docker run --rm -v "${mount}:/w" jrottenberg/ffmpeg:4-alpine -y -i /w/${base} -c copy -movflags +faststart /w/${temp}`,
      { stdio: 'ignore', timeout: 180000, windowsHide: true }
    );
    const dockerOut = path.join(dir, temp);
    if (fs.existsSync(dockerOut) && fs.statSync(dockerOut).size > 0) {
      fs.unlinkSync(filePath);
      fs.renameSync(dockerOut, filePath);
      return true;
    }
  } catch (err) {
    console.warn('MP4 faststart failed:', err.message);
  }
  return false;
}

/** LiveKit egress writes moov after mdat; browsers need faststart for duration + playback. */
function ensureMp4WebPlayable(filePathOrRel) {
  const filePath = path.isAbsolute(filePathOrRel)
    ? filePathOrRel
    : path.join(RECORDINGS_DIR, filePathOrRel);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 1024) return false;
  if (!mp4NeedsFastStart(filePath)) return true;
  return applyMp4FastStart(filePath);
}

function isMp4WebPlayable(relPath) {
  if (!relPath) return false;
  const filePath = path.join(RECORDINGS_DIR, relPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 1024) return false;
  ensureMp4WebPlayable(filePath);
  const { moov, mdat } = mp4AtomPositions(filePath);
  return moov >= 0 && mdat >= 0 && moov < mdat;
}

function readEgressMediaDuration(egressId, roomName) {
  if (!egressId || !roomName) return 0;
  try {
    const hostJson = path.join(RECORDINGS_DIR, roomName, `${egressId}.json`);
    let raw = '';
    if (fs.existsSync(hostJson)) {
      raw = fs.readFileSync(hostJson, 'utf8');
    } else {
      raw = execSync(
        `docker exec ${EGRESS_CONTAINER} cat /out/${roomName}/${egressId}.json`,
        { encoding: 'utf8', timeout: 10000, windowsHide: true }
      );
    }
    const data = JSON.parse(raw);
    if (data.started_at && data.ended_at) {
      return Math.max(1, Math.round((Number(data.ended_at) - Number(data.started_at)) / 1e9));
    }
  } catch (_) {}
  return 0;
}

function resolveRecordingPlayback(recording) {
  const relPath = resolveRelPath(recording);
  if (relPath) ensureFileOnHost(relPath);
  const url = relPath ? buildRecordingUrl(relPath) : (recording.url || '');
  const playable = relPath ? isMp4WebPlayable(relPath) : false;
  return { url, playable, relPath };
}

/**
 * When Egress finishes (or after stop), match the Recording doc to the real MP4 on disk.
 * Only marks completed when the file physically exists.
 */
async function finalizeRecordingOnDisk(recording, relPath, sizeBytes) {
  const Recording = require('../models/Recording');
  const Session   = require('../models/Session');

  const filePath = path.join(RECORDINGS_DIR, relPath);
  if (!ensureMp4WebPlayable(filePath)) {
    return null;
  }

  const url     = buildRecordingUrl(relPath);
  const endedAt = recording.endedAt || new Date();
  let durationSeconds = readEgressMediaDuration(recording.egressId, recording.roomName);
  if (!durationSeconds) durationSeconds = recording.durationSeconds || 0;
  if (!durationSeconds && recording.startedAt) {
    durationSeconds = Math.max(1, Math.round((endedAt.getTime() - new Date(recording.startedAt).getTime()) / 1000));
  }
  const finalSize = fs.existsSync(filePath) ? fs.statSync(filePath).size : (sizeBytes || 0);

  const updated = await Recording.findOneAndUpdate(
    { egressId: recording.egressId },
    {
      $set: {
        status: 'completed',
        url,
        filename: relPath,
        sizeBytes: finalSize,
        endedAt,
        durationSeconds,
        error: '',
      },
    },
    { new: true }
  ).lean();

  if (updated?.sessionId) {
    await Session.findByIdAndUpdate(updated.sessionId, {
      $set: { recordingStatus: 'available', recordingUrl: url, egressId: '' },
    });
  }

  return updated;
}

async function reconcileRecordingByEgressId(egressId, { maxAttempts = 1, delayMs = 0, markFailed = false } = {}) {
  if (!egressId) return null;

  const Recording = require('../models/Recording');
  const Session   = require('../models/Session');

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0 && delayMs > 0) await sleep(delayMs);

    const recording = await Recording.findOne({ egressId }).lean();
    if (!recording) return null;

    if (recording.status === 'completed') {
      const egressPath = resolveRelPathFromEgressMeta(egressId, recording.roomName);
      if (egressPath && ensureFileOnHost(egressPath)) {
        const size = fs.statSync(path.join(RECORDINGS_DIR, egressPath)).size;
        return finalizeRecordingOnDisk(recording, egressPath, size);
      }
      const timePath = relPathFromStartedAt(recording.roomName, recording.startedAt);
      if (timePath) {
        const size = fs.statSync(path.join(RECORDINGS_DIR, timePath)).size;
        return finalizeRecordingOnDisk(recording, timePath, size);
      }
      const { playable, relPath } = resolveRecordingPlayback(recording);
      if (playable && relPath) return recording;
    }

    // Match this egress to its own MP4 via LiveKit egress metadata (never use "latest in room").
    const egressRelPath = resolveRelPathFromEgressMeta(egressId, recording.roomName);
    if (egressRelPath && ensureFileOnHost(egressRelPath)) {
      const size = fs.statSync(path.join(RECORDINGS_DIR, egressRelPath)).size;
      return finalizeRecordingOnDisk(recording, egressRelPath, size);
    }

    const timeRelPath = relPathFromStartedAt(recording.roomName, recording.startedAt);
    if (timeRelPath) {
      const size = fs.statSync(path.join(RECORDINGS_DIR, timeRelPath)).size;
      return finalizeRecordingOnDisk(recording, timeRelPath, size);
    }

    const hintedRelPath = resolveRelPath(recording);
    if (hintedRelPath && ensureFileOnHost(hintedRelPath)) {
      const size = fs.statSync(path.join(RECORDINGS_DIR, hintedRelPath)).size;
      return finalizeRecordingOnDisk(recording, hintedRelPath, size);
    }
  }

  const recording = await Recording.findOne({ egressId }).lean();
  if (!recording) return null;

  if (markFailed && ['processing', 'active'].includes(recording.status)) {
    const error = 'Recording file was not found after processing. Please try recording again.';
    const failed = await Recording.findOneAndUpdate(
      { egressId },
      { $set: { status: 'failed', error } },
      { new: true }
    ).lean();
    if (failed?.sessionId) {
      await Session.findByIdAndUpdate(failed.sessionId, {
        $set: { recordingStatus: 'none', egressId: '' },
      });
    }
    return failed;
  }

  return recording;
}

module.exports = {
  RECORDINGS_DIR,
  BASE_RECORDING_URL,
  normalizeRelPath,
  buildRecordingUrl,
  findLatestMp4InRoom,
  resolveRelPath,
  resolveRelPathFromEgressMeta,
  fileExistsForRelPath,
  mp4NeedsFastStart,
  applyMp4FastStart,
  ensureMp4WebPlayable,
  isMp4WebPlayable,
  readEgressMediaDuration,
  resolveRecordingPlayback,
  finalizeRecordingOnDisk,
  reconcileRecordingByEgressId,
};
