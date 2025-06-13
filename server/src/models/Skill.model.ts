import mongoose, { Schema, Document } from 'mongoose';

// Interface pour typer les documents Skill
export interface ISkill extends Document {
  name: string;
  level?: 'Débutant' | 'Intermédiaire' | 'Confirmé' | 'Expert';
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema: Schema<ISkill> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la compétence est requis.'],
      unique: true,
      trim: true,
      maxlength: [100, 'Le nom de la compétence ne peut pas dépasser 100 caractères.'],
    },
    level: {
      type: String,
      enum: ['Débutant', 'Intermédiaire', 'Confirmé', 'Expert'],
      // required: false, // Par défaut, non requis si pas de message
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, 'La catégorie ne peut pas dépasser 50 caractères.'],
      // required: false,
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    versionKey: false, // N'ajoute pas la version __v
    collection: 'skills', // Nom de la collection dans MongoDB
  }
);

// Middleware pour s'assurer que le nom est en minuscules avant de sauvegarder pour la cohérence
// Note: L'index unique sur 'name' sera sensible à la casse.
// Pour une unicité insensible à la casse, une approche différente pour l'index est nécessaire.
SkillSchema.pre<ISkill>('save', function (next) {
  if (this.isModified('name')) {
    this.name = this.name.toLowerCase();
  }
  next();
});

const SkillModel = mongoose.model<ISkill>('Skill', SkillSchema);

export default SkillModel;
