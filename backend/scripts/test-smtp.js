/**
 * SMTP Test Script
 * Run: node scripts/test-smtp.js
 * 
 * Tests SMTP connection, sends a standalone test email,
 * and prints detailed SMTP response.
 */
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');

(async () => {
  console.log('\n══════════════════════════════════════════════════');
  console.log('📧 SMTP Configuration Test');
  console.log('══════════════════════════════════════════════════\n');

  const config = {
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  console.log('SMTP Config:');
  console.log(`  Host:   ${config.host}`);
  console.log(`  Port:   ${config.port}`);
  console.log(`  Secure: ${config.secure}`);
  console.log(`  User:   ${config.auth.user}`);
  console.log(`  Pass:   ${config.auth.pass ? config.auth.pass.substring(0, 15) + '...' : 'NOT SET'}`);
  console.log(`  From:   ${process.env.SMTP_FROM || 'NOT SET'}\n`);

  // Step 1: Create transporter
  console.log('📦 Creating transporter...');
  const transporter = nodemailer.createTransport(config);

  // Step 2: Verify connection
  console.log('🔍 Verifying SMTP connection...');
  try {
    const verifyResult = await transporter.verify();
    console.log(`✅ transporter.verify() returned: ${verifyResult}\n`);
  } catch (err) {
    console.error(`❌ transporter.verify() FAILED:`);
    console.error(`   Error name:    ${err.name}`);
    console.error(`   Error message: ${err.message}`);
    console.error(`   Error code:    ${err.code}`);
    if (err.code === 'EAUTH') {
      console.error(`   🔴 AUTHENTICATION FAILED — Check SMTP_USER and SMTP_PASS`);
    }
    console.error(`   Full error:`, err);
    console.log();
  }

  // Step 3: Send a standalone test email
  console.log('📤 Sending test email...');
  const testTo = process.env.SMTP_USER || 'test@example.com';
  const testFrom = process.env.SMTP_FROM || `"Test" <${testTo}>`;

  try {
    const info = await transporter.sendMail({
      from:    testFrom,
      to:      testTo,
      subject: '🧪 SMTP Test Email from Younovate LMS',
      html:    `<h1>SMTP Test</h1><p>If you received this, the SMTP configuration is working correctly!</p>
               <p>Time: ${new Date().toISOString()}</p>`,
    });

    console.log(`✅ EMAIL SENT SUCCESSFULLY!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response:   ${info.response}`);
    console.log(`   Accepted:   ${info.accepted}`);
    console.log(`   Rejected:   ${info.rejected}`);
    console.log(`   Envelope:   ${JSON.stringify(info.envelope)}`);
  } catch (err) {
    console.error(`❌ EMAIL SENDING FAILED:`);
    console.error(`   Error name:    ${err.name}`);
    console.error(`   Error message: ${err.message}`);
    console.error(`   Error code:    ${err.code}`);
    console.error(`   Error command: ${err.command}`);
    console.error(`   Error response: ${err.response}`);
    console.error(`   Full error:`, err);

    // Step 4: Try with detailed logging
    console.log('\n🔄 Retrying with logger...');
    const loggerTransporter = nodemailer.createTransport({
      ...config,
      logger: true,
      debug: true,
    });

    try {
      const info2 = await loggerTransporter.sendMail({
        from:    testFrom,
        to:      testTo,
        subject: '🧪 SMTP Test Email (Retry)',
        html:    '<p>Retry test</p>',
      });
      console.log(`✅ Retry succeeded! Message ID: ${info2.messageId}`);
    } catch (err2) {
      console.error(`❌ Retry also FAILED:`);
      console.error(`   Error: ${err2.message}`);
    }
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log('📧 SMTP Test Complete');
  console.log('══════════════════════════════════════════════════\n');
  process.exit(0);
})();
