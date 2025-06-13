import mongoose, { Schema, Document } from 'mongoose';

// Interface pour typer les documents Project
export interface IProject extends Document {
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema<IProject> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre du projet est requis.'],
      trim: true,
      maxlength: [100, 'Le titre du projet ne peut pas dépasser 100 caractères.'],
    },
    description: {
      type: String,
      required: [true, 'La description du projet est requise.'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "L'URL de l'image est requise."],
      trim: true,
      validate: {
        validator: function(v: string) {
          // Accepter soit une URL HTTP/HTTPS valide, soit un chemin commençant par /uploads/projects/
          if (v.startsWith('/uploads/projects/')) {
            return true;
          }
          try {
            new URL(v);
            return v.startsWith('http://') || v.startsWith('https://');
          } catch {
            return false;
          }
        },
        message: 'Veuillez fournir une URL valide pour l\'image (format: http(s):// ou /uploads/projects/...)'
      }
    },
    technologies: {
      type: [String],
      required: [true, 'Au moins une technologie est requise.'],
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: 'Au moins une technologie est requise.',
      },
    },
    githubUrl: {
      type: String,
      trim: true,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Veuillez fournir une URL GitHub valide',
      ],
    },
    demoUrl: {
      type: String,
      trim: true,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Veuillez fournir une URL de démo valide',
      ],
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    versionKey: false, // N'ajoute pas la version __v
    collection: 'projects', // Nom de la collection dans MongoDB
  }
);

// Index pour la recherche par titre et description
ProjectSchema.index({ title: 'text', description: 'text' });

const ProjectModel = mongoose.model<IProject>('Project', ProjectSchema);

export default ProjectModel;
