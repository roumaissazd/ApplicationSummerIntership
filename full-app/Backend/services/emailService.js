const nodemailer = require("nodemailer");
require("dotenv").config();

class EmailService {
  // Initialisation du transporteur
  static transporter = nodemailer.createTransport({
    service: "gmail", // tu peux changer pour Outlook, Yahoo, etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  /**
   * Envoie un email
   * @param {string} to - Destinataire
   * @param {string} subject - Sujet de l'email
   * @param {string} htmlContent - Contenu HTML
   * @param {string} [textContent] - Contenu texte brut (optionnel)
   * @param {string} [from] - Expéditeur (optionnel)
   */
  static async sendEmail(to, subject, htmlContent, textContent = "", from = process.env.EMAIL_USER) {
    try {
      const mailOptions = {
        from: `"Support" <${from}>`,
        to,
        subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]+>/g, ""), // fallback texte
      };

      const info = await EmailService.transporter.sendMail(mailOptions);
      console.log("✅ Email envoyé:", info.messageId);
      return info;
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de l'email:", error.message);
      throw new Error("Échec de l'envoi de l'email");
    }
  }
}

module.exports = EmailService;
