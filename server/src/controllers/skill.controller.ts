import { Request, Response, NextFunction } from 'express';
import SkillModel from '../models/Skill.model'; // Importer le modèle Skill
import { asyncHandler } from '../utils/asyncHandler'; // Ajustement du chemin d'importation
import { ErrorResponse } from '../utils/errorResponse.utils'; // Classe d'erreur personnalisée

// @desc    Get all skills
// @route   GET /api/v1/skills
// @access  Private/Admin (ou public selon besoin)
export const getSkills = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const skills = await SkillModel.find(req.query); // Permet le filtrage simple via query params

  res.status(200).json({
    success: true,
    count: skills.length,
    data: skills,
  });
});

// @desc    Get single skill
// @route   GET /api/v1/skills/:id
// @access  Private/Admin (ou public)
export const getSkill = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const skill = await SkillModel.findById(req.params.id);

  if (!skill) {
    return next(new ErrorResponse(`Compétence non trouvée avec l'ID ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: skill,
  });
});

// @desc    Create new skill
// @route   POST /api/v1/skills
// @access  Private/Admin
export const createSkill = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // req.body devrait contenir { name, level?, category? }
  const skill = await SkillModel.create(req.body);

  res.status(201).json({
    success: true,
    data: skill,
  });
});

// @desc    Update skill
// @route   PUT /api/v1/skills/:id
// @access  Private/Admin
export const updateSkill = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let skill = await SkillModel.findById(req.params.id);

  if (!skill) {
    return next(new ErrorResponse(`Compétence non trouvée avec l'ID ${req.params.id}`, 404));
  }

  // Mettre à jour les champs. new: true renvoie le document modifié. runValidators: true applique les validations du schéma.
  skill = await SkillModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: skill, // skill sera null si la mise à jour a échoué à cause d'une validation, mais findByIdAndUpdate gère cela.
  });
});

// @desc    Delete skill
// @route   DELETE /api/v1/skills/:id
// @access  Private/Admin
export const deleteSkill = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const skill = await SkillModel.findById(req.params.id);

  if (!skill) {
    return next(new ErrorResponse(`Compétence non trouvée avec l'ID ${req.params.id}`, 404));
  }

  await skill.deleteOne(); // Utiliser deleteOne() sur l'instance du document

  res.status(200).json({
    success: true,
    data: {}, // Ou un message de succès
    message: `Compétence '${skill.name}' supprimée avec succès.`
  });
});
