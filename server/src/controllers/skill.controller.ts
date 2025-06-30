import { IRequestWithUser, IResponse } from '../types/express';
import SkillModel from '../models/Skill.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ErrorResponse } from '../utils/errorResponse.utils';

// @desc    Get all skills
// @route   GET /api/v1/skills
// @access  Private/Admin (ou public selon besoin)
export const getSkills = asyncHandler(async (req: IRequestWithUser, res: IResponse, next: Function) => {
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
export const getSkill = asyncHandler(async (req: IRequestWithUser, res: IResponse, next: Function) => {
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
interface CreateSkillBody {
  name: string;
  level: number;
  category: string;
  icon?: string;
  color?: string;
}

export const createSkill = asyncHandler(async (req: IRequestWithUser & { body: CreateSkillBody }, res: IResponse, next: Function) => {
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
interface UpdateSkillBody {
  name?: string;
  level?: number;
  category?: string;
  icon?: string;
  color?: string;
}

export const updateSkill = asyncHandler(async (req: IRequestWithUser & { body: UpdateSkillBody }, res: IResponse, next: Function) => {
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
export const deleteSkill = asyncHandler(async (req: IRequestWithUser, res: IResponse, next: Function) => {
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
