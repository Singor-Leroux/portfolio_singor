import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ErrorResponse } from '../utils/errorResponse.utils';
import Experience, { IExperience } from '../models/Experience.model';

// @desc    Cr\u00E9er une nouvelle exp\u00E9rience
// @route   POST /api/v1/experiences
// @access  Private/Admin
export const createExperience = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const experience = await Experience.create(req.body);
  res.status(201).json({
    success: true,
    data: experience,
  });
});

// @desc    R\u00E9cup\u00E9rer toutes les exp\u00E9riences
// @route   GET /api/v1/experiences
// @access  Public (ou Private/Admin selon vos besoins)
export const getExperiences = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const experiences = await Experience.find().sort({ startDate: -1 }); // Trie par date de d\u00E9but d\u00E9croissante
  res.status(200).json({
    success: true,
    count: experiences.length,
    data: experiences,
  });
});

// @desc    R\u00E9cup\u00E9rer une exp\u00E9rience par son ID
// @route   GET /api/v1/experiences/:id
// @access  Public (ou Private/Admin)
export const getExperienceById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const experience = await Experience.findById(req.params.id);
  if (!experience) {
    return next(new ErrorResponse(`Exp\u00E9rience non trouv\u00E9e avec l'ID ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: experience,
  });
});

// @desc    Mettre \u00E0 jour une exp\u00E9rience
// @route   PUT /api/v1/experiences/:id
// @access  Private/Admin
export const updateExperience = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let experience = await Experience.findById(req.params.id);

  if (!experience) {
    return next(new ErrorResponse(`Exp\u00E9rience non trouv\u00E9e avec l'ID ${req.params.id}`, 404));
  }

  experience = await Experience.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: experience,
  });
});

// @desc    Supprimer une exp\u00E9rience
// @route   DELETE /api/v1/experiences/:id
// @access  Private/Admin
export const deleteExperience = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const experience = await Experience.findById(req.params.id);

  if (!experience) {
    return next(new ErrorResponse(`Exp\u00E9rience non trouv\u00E9e avec l'ID ${req.params.id}`, 404));
  }

  await experience.deleteOne(); // Utilise deleteOne() sur l'instance du document

  res.status(200).json({
    success: true,
    data: {},
  });
});
