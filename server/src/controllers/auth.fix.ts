// Correctifs pour le contrôleur d'authentification
// Ce fichier contient les corrections pour gérer les nouveaux champs utilisateur

import { promises as fs } from 'fs';
import { IUser } from '../models/user.model';

// Fonction pour lire un fichier
const readFile = async (path: string, encoding: BufferEncoding) => {
  return await fs.readFile(path, { encoding });
};

// Fonction pour écrire dans un fichier
const writeFile = async (path: string, data: string, encoding: BufferEncoding) => {
  return await fs.writeFile(path, data, { encoding });
};

// Fonction pour mettre à jour les appels à sendConfirmationEmail
export const fixSendConfirmationEmailCalls = async () => {
  try {
    // Mettre à jour l'appel dans la fonction register
    const registerContent = await readFile('src/controllers/auth.controller.ts', 'utf-8');
    
    // Remplacer l'appel à sendConfirmationEmail dans register
    const updatedRegisterContent = registerContent.replace(
      /const emailSent = await sendConfirmation\(\{[\s\S]*?name: user\.(?:firstName|name),[\s\S]*?\}\);/,
      'const emailSent = await sendConfirmationEmail({\n        to: user.email,\n        name: user.firstName,\n        token: emailVerificationToken\n      });'
    );
    
    // Remplacer l'appel à sendConfirmationEmail dans resendVerificationEmail
    const finalContent = updatedRegisterContent.replace(
      /const emailSent = await sendConfirmation\(\{[\s\S]*?name: user\.(?:firstName|name),[\s\S]*?\}\);/g,
      'const emailSent = await sendConfirmationEmail({\n        to: user.email,\n        name: user.firstName,\n        token: emailVerificationToken\n      });'
    );
    
    // Écrire les modifications dans le fichier
    await writeFile('src/controllers/auth.controller.ts', finalContent, 'utf-8');
    console.log('Mises à jour des appels à sendConfirmationEmail effectuées avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des appels à sendConfirmationEmail:', error);
  }
};

// Fonction pour corriger les références à user.name dans le contrôleur
export const fixUserReferences = async () => {
  try {
    const content = await readFile('src/controllers/auth.controller.ts', 'utf-8');
    
    // Remplacer les références à user.name par user.firstName
    const updatedContent = content
      .replace(/user\.name/g, 'user.firstName')
      .replace(/name: req\.body\.name/g, 'firstName: req.body.firstName, lastName: req.body.lastName')
      .replace(/name: ['"]\$\{user\.name\}['"]/g, 'name: `${user.firstName} ${user.lastName}`');
    
    await writeFile('src/controllers/auth.controller.ts', updatedContent, 'utf-8');
    console.log('Mises à jour des références utilisateur effectuées avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des références utilisateur:', error);
  }
};

// Exécuter les corrections
export const applyAuthFixes = async () => {
  try {
    await fixSendConfirmationEmailCalls();
    await fixUserReferences();
    console.log('✅ Corrections appliquées avec succès au contrôleur d\'authentification');
  } catch (error) {
    console.error('❌ Erreur lors de l\'application des corrections:', error);
  }
};

// Exécuter les corrections si ce fichier est exécuté directement
if (require.main === module) {
  applyAuthFixes();
}
