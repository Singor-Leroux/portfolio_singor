import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
config({ path: path.resolve(__dirname, '../../../.env') });

// Créer un transporteur SMTP réutilisable
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true pour le port 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Vérifier la configuration SMTP
const checkSMTPConfig = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP configuration is missing. Email sending will be disabled.');
    return false;
  }
  return true;
};

// Fonction pour envoyer un email de confirmation
interface SendConfirmationEmailParams {
  to: string;
  name: string;
  token: string;
}

export const sendConfirmationEmail = async ({ to, name, token }: SendConfirmationEmailParams) => {
  if (!checkSMTPConfig()) {
    console.warn('Email not sent: SMTP not configured');
    return false;
  }

  const confirmationUrl = `${process.env.CLIENT_URL}/confirm-email?token=${token}`;
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Portfolio'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to,
    subject: 'Confirmez votre adresse email',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
          <h1>Bienvenue sur Portfolio</h1>
        </div>
        <div style="padding: 20px;">
          <p>Bonjour ${name},</p>
          <p>Merci de vous être inscrit sur notre plateforme. Pour commencer à utiliser votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Confirmer mon email
            </a>
          </div>
          <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur :</p>
          <p style="word-break: break-all;">${confirmationUrl}</p>
          <p>Ce lien expirera dans 24 heures.</p>
          <p>Cordialement,<br>L'équipe Portfolio</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>Si vous n'avez pas créé de compte sur notre plateforme, vous pouvez ignorer cet email.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
};

// Fonction pour envoyer un email de réinitialisation de mot de passe
export const sendPasswordResetEmail = async (email: string, name: string, token: string) => {
  if (!checkSMTPConfig()) {
    console.warn('Email not sent: SMTP not configured');
    return false;
  }

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Portfolio'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
          <h1>Réinitialisation de mot de passe</h1>
        </div>
        <div style="padding: 20px;">
          <p>Bonjour ${name},</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, vous pouvez ignorer cet email.</p>
          <p>Ce lien expirera dans 10 minutes.</p>
          <p>Cordialement,<br>L'équipe Portfolio</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>Si vous avez des questions, n'hésitez pas à nous contacter à l'adresse ${process.env.EMAIL_FROM || process.env.SMTP_USER}.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};
