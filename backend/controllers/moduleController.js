import { asyncHandler, successResponse } from '../utils/helpers.js';
import { Module } from '../models/Module.js';

// GET /api/modules
export const getModules = asyncHandler(async (req, res) => {
  const modules = await Module.findAll();
  successResponse(res, modules);
});

// GET /api/modules/:id
export const getModuleById = asyncHandler(async (req, res) => {
  const moduleData = await Module.findById(req.params.id);
  successResponse(res, moduleData);
});
