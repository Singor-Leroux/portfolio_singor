import { validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import { config } from '../config/config';
import { IRequestWithUser, IResponse } from '../types/express';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure, // true pour le port 465, false pour les autres ports
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

/**
 * Envoie un email de contact
 * @route POST /api/contact
 * @access Public
 */
export const sendContactEmail = async (req: IRequestWithUser, res: IResponse) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const { name, email, subject, message }: ContactFormData = req.body;

    // Options de l'email
    const mailOptions = {
      from: `"${name}" <${config.email.user}>`,
      to: config.email.contactRecipient || config.email.user,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nouveau message de contact</h2>
          <p><strong>De :</strong> ${name} &lt;${email}&gt;</p>
          <p><strong>Sujet :</strong> ${subject}</p>
          <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
            <p style="white-space: pre-line; margin: 0;">${message}</p>
          </div>
          <p style="font-size: 0.9rem; color: #6b7280; margin-top: 2rem;">
            Ce message a été envoyé depuis le formulaire de contact de votre portfolio.
          </p>
        </div>
      `,
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Votre message a été envoyé avec succès !',
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de contact:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer plus tard.',
    });
  }
};
