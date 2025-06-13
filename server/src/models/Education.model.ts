import mongoose, { Document, Schema } from 'mongoose';

export interface IEducation extends Document {
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: Date;
  endDate?: Date; // Peut être vide si en cours
  grade?: string;
  description?: string;
  activities?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema: Schema = new Schema(
  {
    school: {
      type: String,
      required: [true, 'Le nom de l\u0027\u00E9tablissement est requis.'],
      trim: true,
    },
    degree: {
      type: String,
      required: [true, 'Le nom du dipl\u00F4me est requis.'],
      trim: true,
    },
    fieldOfStudy: {
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
    grade: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    activities: {
        type: [String],
        default: [],
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model<IEducation>('Education', EducationSchema);
