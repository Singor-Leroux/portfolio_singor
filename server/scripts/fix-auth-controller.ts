import { readFile, writeFile } from 'fs/promises';
import path from 'path';

async function fixAuthController() {
  try {
    const filePath = path.join(__dirname, '../src/controllers/auth.controller.ts');
    let content = await readFile(filePath, 'utf-8');

    // 1. Remplacer les appels à sendConfirmationEmail
    content = content.replace(
      /const emailSent = await sendConfirmationEmail\(\s*{\s*to: user\.email,\s*name: user\.name,\s*token: emailVerificationToken\s*}\s*\);/g,
      'const emailSent = await sendConfirmationEmail({\n        to: user.email,\n        name: user.firstName,\n        token: emailVerificationToken\n      });'
    );

    // 2. Mettre à jour la fonction updateDetails pour utiliser les nouveaux champs
    content = content.replace(
      /const fieldsToUpdate = \{\s*name: req\.body\.name,\s*email: req\.body\.email,\s*};/,
      'const fieldsToUpdate = {\n      firstName: req.body.firstName,\n      lastName: req.body.lastName,\n      title: req.body.title,\n      email: req.body.email,\n      phone: req.body.phone,\n      address: req.body.address,\n      socialLinks: {\n        github: req.body.github,\n        linkedin: req.body.linkedin,\n        twitter: req.body.twitter\n      }\n    };'
    );

    // 3. Mettre à jour les références à user.name dans les messages
    content = content.replace(
      /name: user\.name/g,
      'name: `${user.firstName} ${user.lastName}`'
    );

    // 4. Mettre à jour les références à name dans les requêtes
    content = content.replace(
      /name: req\.body\.name/g,
      'firstName: req.body.firstName, lastName: req.body.lastName'
    );

    await writeFile(filePath, content, 'utf-8');
    console.log('✅ auth.controller.ts a été mis à jour avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du contrôleur d\'authentification:', error);
    process.exit(1);
  }
}

// Exécuter le script
fixAuthController();
