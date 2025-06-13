import mongoose, { Document, Schema } from 'mongoose';

export interface ICertification extends Document {
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expirationDate?: Date; // Optionnel, certaines certifications n'expirent pas
  credentialID?: string;
  credentialURL?: string;
  imageUrl?: string; // Added for certification image URL
  createdAt: Date;
  updatedAt: Date;
}

const CertificationSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la certification est requis.'],
      trim: true,
    },
    issuingOrganization: {
      type: String,
      required: [true, 'L\u0027organisation \u00E9mettrice est requise.'],
      trim: true,
    },
    issueDate: {
      type: Date,
      required: [true, 'La date d\u0027\u00E9mission est requise.'],
    },
    expirationDate: {
      type: Date,
    },
    credentialID: {
      type: String,
      required: false,
      trim: true,
    },
    credentialURL: {
      type: String,
      required: false,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: false,
      trim: true,
    }, // Added for certification image URL
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model<ICertification>('Certification', CertificationSchema);
