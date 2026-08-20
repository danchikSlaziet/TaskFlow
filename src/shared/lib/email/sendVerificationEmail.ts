import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationCodeEmail(email: string, code: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'TaskFlow <noreply@taskflow.finance67.ru>',
      to: [email],
      subject: `${code} — ваш код подтверждения TaskFlow`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 460px; margin: 0 auto; padding: 32px 24px; background-color: #09090b; color: #fafafa; border-radius: 16px; border: 1px solid #27272a;">
          <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #ffffff;">Добро пожаловать в TaskFlow!</h2>
          <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: #a1a1aa;">
            Введите этот 6-значный код на странице регистрации, чтобы подтвердить ваш аккаунт:
          </p>
          <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 12px; padding: 18px; text-align: center; font-size: 32px; font-weight: 700; tracking: 8px; letter-spacing: 8px; color: #38bdf8; margin-bottom: 24px;">
            ${code}
          </div>
          <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.4;">
            Код действителен в течение 15 минут. Если вы не регистрировались в TaskFlow, просто проигнорируйте это письмо.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err) {
    console.error('Failed to send verification email:', err)
    return { success: false, error: 'Не удалось отправить письмо' }
  }
}