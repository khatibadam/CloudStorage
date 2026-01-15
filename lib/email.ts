import nodemailer from 'nodemailer'

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.warn('⚠️  Variables d\'environnement email manquantes');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

type EmailResult = 
  | { success: true; token: string }
  | { success: false; error: unknown };

export async function sendOTPEmail(email: string): Promise<EmailResult> {
  try {
    const token = Math.floor(100000 + Math.random() * 900000).toString()
    
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Votre code de vérification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Code de vérification</h2>
          <p>Votre code de vérification est :</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
            ${token}
          </div>
          <p style="color: #666;">Ce code expirera dans 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.</p>
        </div>
      `,
      text: `Votre code de vérification est : ${token}. Ce code expirera dans 10 minutes.`,
    })
    
    return { success: true, token }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    return { success: false, error }
  }
}

