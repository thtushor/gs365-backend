"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotionPublicSelectFields = exports.promotionSelectFields = void 0;
const schema_1 = require("../db/schema");
exports.promotionSelectFields = {
    // promotion fields
    id: schema_1.promotions.id,
    promotionName: schema_1.promotions.promotionName,
    promotionTypeId: schema_1.promotions.promotionTypeId,
    status: schema_1.promotions.status,
    dateRange: schema_1.promotions.dateRange,
    minimumDepositAmount: schema_1.promotions.minimumDepositAmount,
    maximumDepositAmount: schema_1.promotions.maximumDepositAmount,
    turnoverMultiply: schema_1.promotions.turnoverMultiply,
    bannerImg: schema_1.promotions.bannerImg,
    bonus: schema_1.promotions.bonus,
    description: schema_1.promotions.description,
    createdBy: schema_1.promotions.createdBy,
    createdAt: schema_1.promotions.createdAt,
    // dropdownOptions fields aliased
    promotionTypeTitle: schema_1.dropdownOptions.title,
    promotionTypeDropdownId: schema_1.dropdownOptions.dropdown_id,
    promotionTypeStatus: schema_1.dropdownOptions.status,
    promotionTypeCreatedBy: schema_1.dropdownOptions.created_by,
    promotionTypeCreatedAt: schema_1.dropdownOptions.created_at,
};
exports.promotionPublicSelectFields = {
    // promotion fields
    id: schema_1.promotions.id,
    promotionName: schema_1.promotions.promotionName,
    promotionTypeId: schema_1.promotions.promotionTypeId,
    dateRange: schema_1.promotions.dateRange,
    minimumDepositAmount: schema_1.promotions.minimumDepositAmount,
    maximumDepositAmount: schema_1.promotions.maximumDepositAmount,
    turnoverMultiply: schema_1.promotions.turnoverMultiply,
    bannerImg: schema_1.promotions.bannerImg,
    bonus: schema_1.promotions.bonus,
    description: schema_1.promotions.description,
    createdAt: schema_1.promotions.createdAt,
    // dropdownOptions fields aliased
    promotionTypeTitle: schema_1.dropdownOptions.title,
    promotionTypeDropdownId: schema_1.dropdownOptions.dropdown_id,
    promotionTypeCreatedAt: schema_1.dropdownOptions.created_at,
};
