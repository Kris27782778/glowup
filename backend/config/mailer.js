const https = require('https');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(to, otp) {
  const html = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#F7F4F2;font-family:'DM Sans',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4F2;padding:40px 0;">
        <tr><td align="center">
          <table width="480" cellpadding="0" cellspacing="0"
            style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
            <tr>
              <td style="background:#1C1917;padding:36px 40px;text-align:center;">
                <p style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;
                           font-size:36px;font-weight:300;letter-spacing:0.18em;color:#F7F4F2;">GL&#332;W</p>
                <p style="margin:8px 0 0;font-size:11px;letter-spacing:0.2em;
                           color:rgba(196,137,122,0.8);text-transform:uppercase;">輔大美妝交流平台</p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px 32px;">
                <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#1C1917;">電子郵件驗證</p>
                <p style="margin:0 0 28px;font-size:14px;color:#6B5E58;line-height:1.6;">
                  請在 <strong>10 分鐘內</strong>輸入以下驗證碼完成註冊。
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td align="center">
                    <div style="display:inline-block;background:#F7F4F2;border:1.5px solid #E5DDD9;
                                border-radius:12px;padding:24px 40px;text-align:center;">
                      <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.15em;
                                 color:#A89990;text-transform:uppercase;">驗證碼</p>
                      <p style="margin:0;font-size:40px;font-weight:700;letter-spacing:0.18em;
                                 color:#C4897A;font-family:'Courier New',monospace;">${otp}</p>
                    </div>
                  </td></tr>
                </table>
                <p style="margin:28px 0 0;font-size:12px;color:#A89990;line-height:1.6;">
                  若您沒有申請 GLŌW 帳號，請忽略此封信件。<br>此驗證碼將於 10 分鐘後失效。
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#F0EBE7;padding:20px 40px;text-align:center;border-top:1px solid #E5DDD9;">
                <p style="margin:0;font-size:11px;color:#A89990;">© 2026 GLŌW · 輔仁大學</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const body = JSON.stringify({
    sender: { name: 'GLŌW 輔大美妝平台', email: 'glow.up.fju@gmail.com' },
    to: [{ email: to }],
    subject: `【GLŌW】您的驗證碼：${otp}`,
    htmlContent: html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function sendWelcomeEmail(to, nickname, studentId, tempPassword) {
  const html = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#F7F4F2;font-family:'DM Sans',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4F2;padding:40px 0;">
        <tr><td align="center">
          <table width="480" cellpadding="0" cellspacing="0"
            style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
            <tr>
              <td style="background:#1C1917;padding:36px 40px;text-align:center;">
                <p style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;
                           font-size:36px;font-weight:300;letter-spacing:0.18em;color:#F7F4F2;">GL&#332;W</p>
                <p style="margin:8px 0 0;font-size:11px;letter-spacing:0.2em;
                           color:rgba(196,137,122,0.8);text-transform:uppercase;">輔大美妝交流平台</p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px 32px;">
                <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#1C1917;">歡迎加入 GLŌW，${nickname}！</p>
                <p style="margin:0 0 28px;font-size:14px;color:#6B5E58;line-height:1.6;">
                  管理員已為你建立帳號。請使用以下臨時密碼登入，<strong>首次登入後系統將要求你設定新密碼</strong>。
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td>
                    <div style="background:#F7F4F2;border:1.5px solid #E5DDD9;border-radius:12px;padding:24px 32px;">
                      <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.15em;color:#A89990;text-transform:uppercase;">登入資訊</p>
                      <p style="margin:0 0 8px;font-size:14px;color:#6B5E58;">
                        學號：<strong style="color:#1C1917;font-family:'Courier New',monospace;">${studentId}</strong>
                      </p>
                      <p style="margin:0;font-size:14px;color:#6B5E58;">
                        臨時密碼：<strong style="color:#C4897A;font-family:'Courier New',monospace;font-size:18px;letter-spacing:0.1em;">${tempPassword}</strong>
                      </p>
                    </div>
                  </td></tr>
                </table>
                <p style="margin:28px 0 0;font-size:12px;color:#A89990;line-height:1.6;">
                  請妥善保管此封信件。若你並未申請 GLŌW 帳號，請忽略此信件或聯絡管理員。
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#F0EBE7;padding:20px 40px;text-align:center;border-top:1px solid #E5DDD9;">
                <p style="margin:0;font-size:11px;color:#A89990;">© 2026 GLŌW · 輔仁大學</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const body = JSON.stringify({
    sender: { name: 'GLŌW 輔大美妝平台', email: 'glow.up.fju@gmail.com' },
    to: [{ email: to }],
    subject: `【GLŌW】歡迎加入！你的帳號已建立`,
    htmlContent: html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function sendGoogleBindEmail(to, nickname, googleEmail) {
  const html = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#F7F4F2;font-family:'DM Sans',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4F2;padding:40px 0;">
        <tr><td align="center">
          <table width="480" cellpadding="0" cellspacing="0"
            style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
            <tr>
              <td style="background:#1C1917;padding:36px 40px;text-align:center;">
                <p style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;
                           font-size:36px;font-weight:300;letter-spacing:0.18em;color:#F7F4F2;">GL&#332;W</p>
                <p style="margin:8px 0 0;font-size:11px;letter-spacing:0.2em;
                           color:rgba(196,137,122,0.8);text-transform:uppercase;">輔大美妝交流平台</p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px 32px;">
                <p style="margin:0 0 20px;font-size:20px;font-weight:600;color:#1C1917;">Google 帳號綁定成功</p>
                <p style="margin:0 0 16px;font-size:14px;color:#6B5E58;line-height:1.8;">
                  Hi ${nickname}，
                </p>
                <p style="margin:0 0 16px;font-size:14px;color:#6B5E58;line-height:1.8;">
                  您的 GLŌW 帳號已成功綁定 Google 帳號（<strong>${googleEmail}</strong>）。
                </p>
                <p style="margin:0 0 16px;font-size:14px;color:#6B5E58;line-height:1.8;">
                  日後您可以使用 Google 帳號直接登入 GLŌW，即使校園信箱到期也不影響使用。
                </p>
                <div style="background:#FFF8F6;border:1.5px solid #F0D5CC;border-radius:10px;padding:16px 20px;margin:24px 0;">
                  <p style="margin:0;font-size:13px;color:#C4614A;line-height:1.7;">
                    如果這不是您本人的操作，請立即至設定頁面取消綁定，或聯繫我們的客服。
                  </p>
                </div>
                <p style="margin:0;font-size:13px;color:#A89990;line-height:1.6;">GLŌW 團隊</p>
              </td>
            </tr>
            <tr>
              <td style="background:#F0EBE7;padding:20px 40px;text-align:center;border-top:1px solid #E5DDD9;">
                <p style="margin:0;font-size:11px;color:#A89990;">© 2026 GLŌW · 輔仁大學</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"GLŌW 輔大美妝平台" <${process.env.SMTP_USER}>`,
    to,
    subject: 'GLŌW — Google 帳號綁定成功通知',
    html,
  });
}

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendGoogleBindEmail };
