"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignationController = void 0;
exports.formatZodFieldErrors = formatZodFieldErrors;
const zod_1 = require("zod");
const designation_model_1 = require("../models/designation.model");
// Validation schemas
const designationSchema = zod_1.z.object({
    // adminId: z.number().min(1, "Admin ID must be greater than 0"),
    designationName: zod_1.z
        .string()
        .min(2, "Designation name must be at least 2 characters")
        .max(200, "Designation name cannot exceed 200 characters"),
    adminUserType: zod_1.z
        .string()
        .min(2, "Admin user type must be at least 2 characters")
        .max(100, "Admin user type cannot exceed 100 characters"),
    permissions: zod_1.z
        .array(zod_1.z.string())
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
function formatZodFieldErrors(error) {
    const fieldErrors = error.flatten().fieldErrors;
    return Object.entries(fieldErrors)
        .map(([field, messages]) => `${field}: ${messages?.join(", ")}`)
        .join(" | ");
}
exports.DesignationController = {
    // CREATE
    async create(req, res) {
        const parsed = designationSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                message: formatZodFieldErrors(parsed.error),
            });
        }
        try {
            const result = await designation_model_1.DesignationModel.create(parsed.data);
            res.status(201).json({ status: true, data: result });
        }
        catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    // GET ALL
    async getAll(req, res) {
        try {
            const data = await designation_model_1.DesignationModel.findAll();
            res.json({ status: true, data });
        }
        catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    // GET ONE
    async getById(req, res) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ status: false, message: "Invalid ID" });
            }
            const data = await designation_model_1.DesignationModel.findById(id);
            if (!data) {
                return res.status(404).json({ status: false, message: "Not found" });
            }
            res.json({ status: true, data });
        }
        catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    // UPDATE
    async update(req, res) {
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
            const result = await designation_model_1.DesignationModel.update(id, parsed.data);
            if (!result) {
                return res.status(404).json({ status: false, message: "Not found" });
            }
            res.json({ status: true, data: result });
        }
        catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    // DELETE
    async remove(req, res) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ status: false, message: "Invalid ID" });
            }
            const result = await designation_model_1.DesignationModel.remove(id);
            if (!result) {
                return res.status(404).json({ status: false, message: "Not found" });
            }
            res.json({ status: true, message: "Deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
};
