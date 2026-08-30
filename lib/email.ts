import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.QQ_EMAIL_USER,
    pass: process.env.QQ_EMAIL_AUTH_CODE,
  },
});

/** Send OTP verification code via email */
export async function sendOtpEmail(
  email: string,
  code: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await transporter.sendMail({
      from: `"玄语" <${process.env.QQ_EMAIL_USER}>`,
      to: email,
      subject: '玄语 - 登录验证码',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 32px;">🔮</span>
            <h1 style="font-size: 20px; color: #1c1917; margin-top: 8px;">玄语</h1>
          </div>
          <div style="background: #fafaf9; border-radius: 12px; padding: 32px; text-align: center;">
            <p style="color: #57534e; font-size: 14px; margin-bottom: 16px;">您的登录验证码</p>
            <div style="font-size: 36px; font-weight: bold; color: #312e81; letter-spacing: 8px; margin: 24px 0;">
              ${code}
            </div>
            <p style="color: #a3a3a3; font-size: 12px;">验证码 5 分钟内有效，请勿泄露给他人</p>
          </div>
          <p style="color: #a3a3a3; font-size: 12px; text-align: center; margin-top: 24px;">
            如果您没有请求此验证码，请忽略此邮件。
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email send failed',
    };
  }
}
