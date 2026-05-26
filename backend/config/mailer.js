const https = require('https');

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

module.exports = { sendVerificationEmail };
