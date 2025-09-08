// designation.controller.ts
import { Request, Response } from "express";
import { z } from "zod";
import { DesignationModel } from "../models/designation.model";


// Validation schemas
const designationSchema = z.object({
  // adminId: z.number().min(1, "Admin ID must be greater than 0"),
  designationName: z
    .string()
    .min(2, "Designation name must be at least 2 characters")
    .max(200, "Designation name cannot exceed 200 characters"),
  adminUserType: z
    .string()
    .min(2, "Admin user type must be at least 2 characters")
    .max(100, "Admin user type cannot exceed 100 characters"),
  permissions: z
    .array(z.string())
    .nonempty("At least one permission is required"),
});

const updateSchema = designationSchema.partial();

// helper to format zod errors
// function formatZodError(error: z.ZodError) {
//   return error.map(err => ({
//     field: err.path.join("."), // which field failed
//     message: err.message,      // readable message
//   }));
// }

export function formatZodFieldErrors(error: z.ZodError) {
  const fieldErrors = error.flatten().fieldErrors;

  return Object.entries(fieldErrors)
    .map(([field, messages]) => `${field}: ${(messages as unknown as string[])?.join(", ")}`)
    .join(" | ");
}

export const DesignationController = {
  // CREATE
  async create(req: Request, res: Response) {
    const parsed = designationSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        status: false,
        message: formatZodFieldErrors(parsed.error),
      });
    }

    try {
      const result = await DesignationModel.create(parsed.data);
      res.status(201).json({ status: true, data: result });
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  // GET ALL
  async getAll(req: Request, res: Response) {
    try {
      const data = await DesignationModel.findAll();
      res.json({ status: true, data });
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  // GET ONE
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: false, message: "Invalid ID" });
      }

      const data = await DesignationModel.findById(id);
      if (!data) {
        return res.status(404).json({ status: false, message: "Not found" });
      }

      res.json({ status: true, data });
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  // UPDATE
  async update(req: Request, res: Response) {
    const parsed = updateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        status: false,
        message: formatZodFieldErrors(parsed.error),
      });
    }

    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: false, message: "Invalid ID" });
      }

      const result = await DesignationModel.update(id, parsed.data);

      if (!result) {
        return res.status(404).json({ status: false, message: "Not found" });
      }

      res.json({ status: true, data: result });
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  // DELETE
  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: false, message: "Invalid ID" });
      }

      const result = await DesignationModel.remove(id);

      if (!result) {
        return res.status(404).json({ status: false, message: "Not found" });
      }

      res.json({ status: true, message: "Deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  },
};
