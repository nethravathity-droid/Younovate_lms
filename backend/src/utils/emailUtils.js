// src/utils/emailUtils.js
'use strict';
const nodemailer = require('nodemailer');

// ── SMTP Configuration ────────────────────────────────────────────────────────
const smtpConfig = {
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

console.log('\n════════════════════════════════════════════');
console.log('📧 SMTP Configuration');
console.log('════════════════════════════════════════════');
console.log(`   SMTP_HOST:        ${process.env.SMTP_HOST || 'NOT SET'}`);
console.log(`   SMTP_PORT:        ${Number(process.env.SMTP_PORT) || 587}`);
console.log(`   SMTP_SECURE:      ${process.env.SMTP_SECURE || 'false'}`);
console.log(`   SMTP_USER:        ${process.env.SMTP_USER || 'NOT SET'}`);
console.log(`   SMTP_PASS:        ${process.env.SMTP_PASS ? process.env.SMTP_PASS.substring(0, 10) + '...' : 'NOT SET'}`);
console.log(`   SMTP_FROM:        ${process.env.SMTP_FROM || 'NOT SET'}`);
console.log('════════════════════════════════════════════\n');

const transporter = nodemailer.createTransport(smtpConfig);

// ── Verify SMTP connection on startup ──────────────────────────────────────
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ SMTP CONNECTION VERIFICATION FAILED:');
    console.error(`   Error: ${err.message}`);
    console.error(`   Full error:`, err);
    console.error('   Check your SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env');
    console.error('   For Brevo: SMTP_HOST should be smtp-relay.brevo.com');
  } else {
    console.log(`✅ SMTP connection verified successfully — ready to send emails`);
  }
});

const sendEmail = async ({ to, subject, html }) => {
  const from = process.env.SMTP_FROM || `"Younovate LMS" <noreply@younovate.in>`;
  
  console.log(`\n📧 SENDING EMAIL`);
  console.log(`   From:    ${from}`);
  console.log(`   To:      ${to}`);
  console.log(`   Subject: ${subject}`);
  
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response:   ${info.response}`);
    console.log(`   Accepted:   ${info.accepted}`);
    console.log(`   Rejected:   ${info.rejected}`);
    
    return info;
  } catch (err) {
    console.error(`❌ EMAIL SENDING FAILED to ${to}`);
    console.error(`   Error name:    ${err.name}`);
    console.error(`   Error message: ${err.message}`);
    console.error(`   Error code:    ${err.code}`);
    console.error(`   Error command: ${err.command}`);
    console.error(`   Full error:`, err);
    console.error(`   SMTP Host: ${process.env.SMTP_HOST}`);
    console.error(`   SMTP Port: ${process.env.SMTP_PORT}`);
    console.error(`   SMTP User: ${process.env.SMTP_USER}`);
    
    // Check for common issues
    if (err.message && err.message.includes('Invalid login')) {
      console.error(`   🔴 INVALID LOGIN: Check SMTP_USER and SMTP_PASS`);
      console.error(`   🔴 For Brevo, SMTP_PASS should be your xsmtpsib-... API key`);
    }
    if (err.message && err.message.includes('getaddrinfo')) {
      console.error(`   🔴 DNS LOOKUP FAILED: Check SMTP_HOST`);
      console.error(`   🔴 For Brevo, SMTP_HOST should be smtp-relay.brevo.com`);
    }
    if (err.code === 'EAUTH') {
      console.error(`   🔴 AUTHENTICATION FAILED: Check SMTP_USER and SMTP_PASS`);
    }
    if (err.code === 'ESOCKET') {
      console.error(`   🔴 SOCKET ERROR: Check SMTP_HOST and SMTP_PORT`);
    }
    
    throw err; // Re-throw so caller can handle
  }
};

// ── OTP email template ────────────────────────────────────────────────────────
const otpTemplate = (name, otp) => `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0A0F1E;font-family:system-ui,sans-serif">
<div style="max-width:480px;margin:40px auto;background:#111827;border-radius:16px;overflow:hidden;border:1px solid #1e2a3f">
  <div style="background:#6366f1;padding:28px 32px"><h1 style="margin:0;font-size:22px;color:#fff;font-weight:700">Younovate LMS</h1>
  <p style="margin:4px 0 0;font-size:13px;color:#c7d2fe">Password Reset Request</p></div>
  <div style="padding:32px">
    <p style="color:#94a3b8;font-size:15px;margin:0 0 8px">Hi ${name},</p>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 28px;line-height:1.6">Your one-time password — expires in <strong style="color:#f1f5f9">5 minutes</strong>.</p>
    <div style="background:#1a2235;border:1.5px solid #1e2a3f;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px">
      <div style="font-size:42px;font-weight:800;letter-spacing:14px;color:#a5b4fc;font-family:monospace">${otp}</div>
      <p style="margin:10px 0 0;font-size:12px;color:#475569">One-time password · Valid for 5 minutes</p>
    </div>
    <p style="color:#475569;font-size:12px;margin:0;line-height:1.6">If you didn't request this, ignore this email. Your password won't change.</p>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #1e2a3f;text-align:center">
    <p style="color:#374151;font-size:11px;margin:0">© 2026 Younovate Labs · All rights reserved</p>
  </div>
</div></body></html>`;

// ── Password changed confirmation ──────────────────────────────────────────────
const pwChangedTemplate = (name) => `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0A0F1E;font-family:system-ui,sans-serif">
<div style="max-width:480px;margin:40px auto;background:#111827;border-radius:16px;overflow:hidden;border:1px solid #1e2a3f">
  <div style="background:#15803d;padding:28px 32px"><h1 style="margin:0;font-size:22px;color:#fff;font-weight:700">Younovate LMS</h1>
  <p style="margin:4px 0 0;font-size:13px;color:#bbf7d0">Password Changed Successfully</p></div>
  <div style="padding:32px">
    <p style="color:#94a3b8;font-size:15px;margin:0 0 8px">Hi ${name},</p>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.6">Your password was successfully changed. Sign in with your new password.</p>
    <p style="color:#f87171;font-size:13px;background:#1a2235;border:1px solid #991b1b;border-radius:8px;padding:14px 16px;margin:0;line-height:1.6">
      If you did not make this change, contact <a href="mailto:support@younovate.in" style="color:#fca5a5">support@younovate.in</a> immediately.
    </p>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #1e2a3f;text-align:center"><p style="color:#374151;font-size:11px;margin:0">© 2026 Younovate Labs</p></div>
</div></body></html>`;

// ── Workshop Approved (existing user) ──────────────────────────────────────────
const workshopApprovedTemplate = (name, workshopTitle, loginUrl) => `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0A0F1E;font-family:system-ui,sans-serif">
<div style="max-width:480px;margin:40px auto;background:#111827;border-radius:16px;overflow:hidden;border:1px solid #1e2a3f">
  <div style="background:#15803d;padding:28px 32px"><h1 style="margin:0;font-size:22px;color:#fff;font-weight:700">Younovate LMS</h1>
  <p style="margin:4px 0 0;font-size:13px;color:#bbf7d0">Workshop Approved</p></div>
  <div style="padding:32px">
    <p style="color:#94a3b8;font-size:15px;margin:0 0 8px">Hi ${name},</p>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 16px;line-height:1.6">
      Your registration for <strong style="color:#f1f5f9">${workshopTitle}</strong> has been approved!
    </p>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.6">
      You can now log in to access the workshop dashboard and join sessions.
    </p>
    <div style="text-align:center;margin-bottom:28px">
      <a href="${loginUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px">Log In to Workshop</a>
    </div>
    <p style="color:#475569;font-size:12px;margin:0;line-height:1.6">
      If the button doesn't work, copy this URL into your browser:<br>
      <span style="color:#818cf8;word-break:break-all">${loginUrl}</span>
    </p>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #1e2a3f;text-align:center">
    <p style="color:#374151;font-size:11px;margin:0">© 2026 Younovate Labs · All rights reserved</p>
  </div>
</div></body></html>`;

// ── Login Credentials (new user — includes temp password) ──────────────────────
const loginCredentialsTemplate = (name, email, tempPassword, workshopTitle, loginUrl) => `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0A0F1E;font-family:system-ui,sans-serif">
<div style="max-width:480px;margin:40px auto;background:#111827;border-radius:16px;overflow:hidden;border:1px solid #1e2a3f">
  <div style="background:#6366f1;padding:28px 32px"><h1 style="margin:0;font-size:22px;color:#fff;font-weight:700">Younovate LMS</h1>
  <p style="margin:4px 0 0;font-size:13px;color:#c7d2fe">Welcome to Your Workshop</p></div>
  <div style="padding:32px">
    <p style="color:#94a3b8;font-size:15px;margin:0 0 8px">Hi ${name},</p>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 16px;line-height:1.6">
      Your registration for <strong style="color:#f1f5f9">${workshopTitle}</strong> has been approved and an account has been created for you.
    </p>

    <div style="background:#1a2235;border:1.5px solid #1e2a3f;border-radius:12px;padding:24px;margin-bottom:24px">
      <p style="color:#94a3b8;font-size:12px;margin:0 0 12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Your Login Credentials</p>
      <div style="margin-bottom:10px">
        <span style="color:#64748b;font-size:12px;display:block">Email</span>
        <span style="color:#f1f5f9;font-size:15px;font-weight:600;font-family:monospace">${email}</span>
      </div>
      <div style="margin-bottom:4px">
        <span style="color:#64748b;font-size:12px;display:block">Temporary Password</span>
        <span style="color:#fbbf24;font-size:16px;font-weight:800;font-family:monospace;letter-spacing:1px;background:#1f2937;padding:6px 12px;border-radius:8px;display:inline-block">${tempPassword}</span>
      </div>
      <p style="color:#f87171;font-size:12px;margin:8px 0 0">⚠ Please change your password after first login.</p>
    </div>

    <div style="text-align:center;margin-bottom:24px">
      <a href="${loginUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px">Log In to Your Account</a>
    </div>

    <p style="color:#475569;font-size:12px;margin:0;line-height:1.6">
      If the button doesn't work, copy this URL into your browser:<br>
      <span style="color:#818cf8;word-break:break-all">${loginUrl}</span>
    </p>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #1e2a3f;text-align:center">
    <p style="color:#374151;font-size:11px;margin:0">© 2026 Younovate Labs · All rights reserved</p>
  </div>
</div></body></html>`;

module.exports = { sendEmail, otpTemplate, pwChangedTemplate, workshopApprovedTemplate, loginCredentialsTemplate };
