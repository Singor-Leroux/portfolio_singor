import { IRequestWithUser, IResponse } from '../types/express';
import { asyncHandler } from '../utils/asyncHandler';
import { ErrorResponse } from '../utils/errorResponse.utils';
import Certification, { ICertification } from '../models/Certification.model';
import fs from 'fs';
import path from 'path';

// Helper function to delete an image file
const deleteImageFile = (imageUrl: string | undefined) => {
  if (imageUrl) {
    const imagePath = path.join(__dirname, '..', '..', 'public', imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) console.error(`Erreur lors de la suppression de l'ancienne image: ${imagePath}`, err);
      });
    }
  }
};

// Helper function to transform backend document to frontend-friendly object
const transformCertificationForFrontend = (certDoc: ICertification) => {
  return {
    _id: (certDoc._id as any).toString(), // Ensure _id is a string
    title: certDoc.name,
    issuer: certDoc.issuingOrganization,
    date: certDoc.issueDate instanceof Date ? certDoc.issueDate.toLocaleDateString('fr-CA') : certDoc.issueDate, // Format YYYY-MM-DD or keep as is if already string
    credentialUrl: certDoc.credentialURL,
    imageUrl: certDoc.imageUrl, // Added imageUrl
    createdAt: certDoc.createdAt.toISOString(),
    updatedAt: certDoc.updatedAt.toISOString(),
    // Include other fields from ICertification if needed by frontend, like expirationDate or credentialID
    expirationDate: certDoc.expirationDate ? (certDoc.expirationDate instanceof Date ? certDoc.expirationDate.toLocaleDateString('fr-CA') : certDoc.expirationDate) : undefined,
    credentialID: certDoc.credentialID,
  };
};

// Helper function to transform multiple documents
const transformCertificationsForFrontend = (certDocs: ICertification[]) => {
  return certDocs.map(transformCertificationForFrontend);
};


// @desc    Créer une nouvelle certification
// @route   POST /api/v1/certifications
// @access  Private/Admin
interface CreateCertificationBody {
  name: string;
  issuingOrganization: string;
  issueDate: Date | string;
  expirationDate?: Date | string;
  credentialURL?: string;
  credentialID?: string;
  imageUrl?: string;
}

export const createCertification = asyncHandler(async (req: IRequestWithUser & { body: CreateCertificationBody; file?: Express.Multer.File }, res: IResponse, next: Function) => {
  const { title, issuer, date, credentialUrl } = req.body; // imageUrl removed from body destructuring

  // Map frontend fields to backend model fields
  const certificationData: Partial<ICertification> = {
    name: title,
    issuingOrganization: issuer,
    credentialURL: credentialUrl,
  };

  if (req.file) {
    certificationData.imageUrl = `/uploads/certifications/${req.file.filename}`;
  }

  // Convert date string to Date object for issueDate
  if (date) {
    certificationData.issueDate = new Date(date);
    if (isNaN(certificationData.issueDate.getTime())) {
        return next(new ErrorResponse(`Date d'obtention invalide: ${date}`, 400));
    }
  }

  const newCertification = await Certification.create(certificationData);
  res.status(201).json({
    success: true,
    data: transformCertificationForFrontend(newCertification),
  });
});

// @desc    Récupérer toutes les certifications
// @route   GET /api/v1/certifications
// @access  Public (ou Private/Admin) // Should be Private/Admin if it's for admin panel
export const getCertifications = asyncHandler(async (req: IRequestWithUser, res: IResponse, next: Function) => {
  const certifications = await Certification.find().sort({ issueDate: -1 });
  res.status(200).json({
    success: true,
    count: certifications.length,
    data: transformCertificationsForFrontend(certifications),
  });
});

// @desc    Récupérer une certification par son ID
// @route   GET /api/v1/certifications/:id
// @access  Public (ou Private/Admin) // Should be Private/Admin
export const getCertification = asyncHandler(async (req: IRequestWithUser, res: IResponse, next: Function) => {
  const certification = await Certification.findById(req.params.id);
  if (!certification) {
    return next(new ErrorResponse(`Certification non trouvée avec l'ID ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: transformCertificationForFrontend(certification),
  });
});

// @desc    Mettre à jour une certification
// @route   PUT /api/v1/certifications/:id
// @access  Private/Admin
interface UpdateCertificationBody {
  name?: string;
  issuingOrganization?: string;
  issueDate?: Date | string;
  expirationDate?: Date | string | null;
  credentialURL?: string;
  credentialID?: string;
  imageUrl?: string;
}

export const updateCertification = asyncHandler(async (req: IRequestWithUser & { body: UpdateCertificationBody; file?: Express.Multer.File }, res: IResponse, next: Function) => {
  const { title, issuer, date, credentialUrl } = req.body; // imageUrl removed from body destructuring
  const existingImageUrl = req.body.imageUrl; // Keep track of imageUrl sent from frontend (could be empty string)

  const certificationToUpdate = await Certification.findById(req.params.id);
  if (!certificationToUpdate) {
    return next(new ErrorResponse(`Certification non trouvée avec l'ID ${req.params.id}`, 404));
  }

  // Map frontend fields to backend model fields
  if (title !== undefined) certificationToUpdate.name = title;
  if (issuer !== undefined) certificationToUpdate.issuingOrganization = issuer;
  if (credentialUrl !== undefined) certificationToUpdate.credentialURL = credentialUrl;

  // Handle image update
  if (req.file) {
    // New image uploaded, delete old one if exists
    deleteImageFile(certificationToUpdate.imageUrl);
    certificationToUpdate.imageUrl = `/uploads/certifications/${req.file.filename}`;
  } else if (existingImageUrl === '' || existingImageUrl === null) {
    // No new file, but imageUrl in body is empty string or null, so delete existing image
    deleteImageFile(certificationToUpdate.imageUrl);
    certificationToUpdate.imageUrl = undefined; // Remove from DB
  }
  // If no new file and existingImageUrl is not empty, do nothing to the image (it remains as is)

  // Convert date string to Date object for issueDate
  if (date !== undefined) {
    certificationToUpdate.issueDate = new Date(date);
    if (isNaN(certificationToUpdate.issueDate.getTime())) {
        return next(new ErrorResponse(`Date d'obtention invalide pour la mise à jour: ${date}`, 400));
    }
  }
  
  // Handle optional fields if provided
  // if (expirationDate !== undefined) certificationToUpdate.expirationDate = new Date(expirationDate);
  // if (credentialID !== undefined) certificationToUpdate.credentialID = credentialID;

  const updatedCertification = await certificationToUpdate.save();

  res.status(200).json({
    success: true,
    data: transformCertificationForFrontend(updatedCertification),
  });
});

// @desc    Supprimer une certification
// @route   DELETE /api/v1/certifications/:id
// @access  Private/Admin
export const deleteCertification = asyncHandler(async (req: IRequestWithUser, res: IResponse, next: Function) => {
  const certification = await Certification.findById(req.params.id);

  if (!certification) {
    return next(new ErrorResponse(`Certification non trouvée avec l'ID ${req.params.id}`, 404));
  }

  // Delete associated image file if it exists
  deleteImageFile(certification.imageUrl);

  await certification.deleteOne(); // Mongoose v6+ uses deleteOne()

  res.status(200).json({
    success: true,
    data: {}, // Or perhaps send back the transformed deleted item or just a success message
  });
});
