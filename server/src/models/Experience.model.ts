import mongoose, { Document, Schema } from 'mongoose';

export interface IExperience extends Document {
  title: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date; // Peut être vide si c'est le poste actuel
  description?: string;
  technologies?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre du poste est requis.'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Le nom de l\u0027entreprise est requis.'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'La date de d\u00E9but est requise.'],
    },
    endDate: {
      type: Date,
    },
    description: {
      type: String,
      trim: true,
    },
    technologies: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt
    versionKey: false,
  }
);

export default mongoose.model<IExperience>('Experience', ExperienceSchema);
