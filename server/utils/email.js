const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  // Gmail shortcut
  if (process.env.GMAIL_USER) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASS },
    });
  }
  return null;
};

const FROM = `"DevBlog" <${process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@devblog.com'}>`;

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('[Email skipped — SMTP not configured]', subject, '->', to);
    return;
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    console.log('[Email sent]', subject, '->', to);
  } catch (err) {
    console.error('[Email error]', err.message);
  }
};

// ── Email templates ──

exports.sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: '👋 Welcome to DevBlog!',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0f0f13;color:#e2e2e8;padding:40px;border-radius:12px;">
        <h1 style="color:#7c6af7;margin-bottom:8px;">Welcome, ${user.name}! ✨</h1>
        <p style="color:#8b8b9e;margin-bottom:24px;">You've joined the DevBlog community. Start sharing your ideas with the world.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/write"
           style="display:inline-block;background:#7c6af7;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
          Write your first post →
        </a>
        <p style="margin-top:32px;font-size:12px;color:#55556a;">You're receiving this because you signed up on DevBlog.</p>
      </div>
    `,
  });
};

exports.sendCommentNotification = async ({ postAuthor, commenter, post, commentText }) => {
  if (!postAuthor.notificationPrefs?.comments) return;
  await sendEmail({
    to: postAuthor.email,
    subject: `💬 ${commenter.name} commented on "${post.title}"`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0f0f13;color:#e2e2e8;padding:40px;border-radius:12px;">
        <h2 style="color:#7c6af7;">New comment on your post</h2>
        <p style="color:#8b8b9e;">
          <strong style="color:#e2e2e8;">${commenter.name}</strong> commented on 
          <strong style="color:#e2e2e8;">"${post.title}"</strong>:
        </p>
        <blockquote style="border-left:3px solid #7c6af7;padding:12px 20px;background:#1e1e2a;border-radius:0 8px 8px 0;color:#b0b0c0;margin:20px 0;">
          ${commentText.substring(0, 200)}${commentText.length > 200 ? '...' : ''}
        </blockquote>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/post/${post.slug}"
           style="display:inline-block;background:#7c6af7;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
          View post →
        </a>
      </div>
    `,
  });
};

exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: '🔐 Reset your DevBlog password',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0f0f13;color:#e2e2e8;padding:40px;border-radius:12px;">
        <h2 style="color:#7c6af7;">Password Reset</h2>
        <p style="color:#8b8b9e;">Click below to reset your password. Link expires in 1 hour.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#7c6af7;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
          Reset password →
        </a>
        <p style="margin-top:20px;font-size:12px;color:#55556a;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};
