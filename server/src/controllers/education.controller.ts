import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ErrorResponse } from '../utils/errorResponse.utils';
import Education, { IEducation } from '../models/Education.model';

// Interface for the transformed education object matching frontend expectations (e.g., EducationBE)
interface TransformedEducation {
  _id: string;
  degree: string;
  institution: string; // Mapped from 'school'
  fieldOfStudy?: string;
  startDate: string; // ISO string date
  endDate?: string; // ISO string date
  grade?: string;
  description?: string;
  activities?: string[];
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

// Helper to transform a single education document for API response
const transformToApiResponse = (doc: IEducation | null): TransformedEducation | null => {
  if (!doc) return null;
  // Convert Mongoose document to plain object, including virtuals if any
  const educationObject = doc.toObject ? doc.toObject({ virtuals: true }) : { ...doc };
  
  const { school, _id, startDate, endDate, createdAt, updatedAt, ...rest } = educationObject;
  
  return {
    ...rest,
    _id: _id.toString(),
    institution: school, // Map school to institution
    startDate: startDate instanceof Date ? startDate.toISOString() : String(startDate),
    endDate: endDate ? (endDate instanceof Date ? endDate.toISOString() : String(endDate)) : undefined,
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : String(createdAt),
    updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : String(updatedAt),
  } as TransformedEducation;
};

// Helper to transform an array of education documents
const transformArrayToApiResponse = (docs: IEducation[]): TransformedEducation[] => {
  return docs.map(doc => transformToApiResponse(doc)).filter(doc => doc !== null) as TransformedEducation[];
};

// @desc    Créer une nouvelle formation
// @route   POST /api/v1/educations
// @access  Private/Admin
export const createEducation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { institution, ...restOfBody } = req.body;
  const educationDataToCreate: Partial<IEducation> = {
    ...restOfBody,
  };
  if (institution) {
    educationDataToCreate.school = institution;
  }

  const newEducationDoc = await Education.create(educationDataToCreate);
  const responseData = transformToApiResponse(newEducationDoc);

  res.status(201).json({
    success: true,
    data: responseData,
  });
});

// @desc    Récupérer toutes les formations
// @route   GET /api/v1/educations
// @access  Public (ou Private/Admin)
export const getEducations = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const educationDocs = await Education.find().sort({ startDate: -1 });
  const responseData = transformArrayToApiResponse(educationDocs);

  res.status(200).json({
    success: true,
    count: responseData.length,
    data: responseData,
  });
});

// @desc    Récupérer une formation par son ID
// @route   GET /api/v1/educations/:id
// @access  Public (ou Private/Admin)
export const getEducationById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const educationDoc = await Education.findById(req.params.id);
  if (!educationDoc) {
    return next(new ErrorResponse(`Formation non trouvée avec l'ID ${req.params.id}`, 404));
  }
  const responseData = transformToApiResponse(educationDoc);

  res.status(200).json({
    success: true,
    data: responseData,
  });
});

// @desc    Mettre à jour une formation
// @route   PUT /api/v1/educations/:id
// @access  Private/Admin
export const updateEducation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const educationDoc = await Education.findById(req.params.id);

  if (!educationDoc) {
    return next(new ErrorResponse(`Formation non trouvée avec l'ID ${req.params.id}`, 404));
  }

  const { institution, ...restOfBody } = req.body;
  const educationDataToUpdate: Partial<IEducation> = {
    ...restOfBody,
  };
  if (institution) {
    educationDataToUpdate.school = institution;
  }

  const updatedEducationDoc = await Education.findByIdAndUpdate(req.params.id, educationDataToUpdate, {
    new: true,
    runValidators: true,
  });
  
  const responseData = transformToApiResponse(updatedEducationDoc);

  res.status(200).json({
    success: true,
    data: responseData,
  });
});

// @desc    Supprimer une formation
// @route   DELETE /api/v1/educations/:id
// @access  Private/Admin
export const deleteEducation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const education = await Education.findById(req.params.id);

  if (!education) {
    return next(new ErrorResponse(`Formation non trouvée avec l'ID ${req.params.id}`, 404));
  }

  await education.deleteOne(); // Corrected from education.remove() which is deprecated

  res.status(200).json({
    success: true,
    data: {},
  });
});
