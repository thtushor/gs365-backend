import { dropdownOptions, promotions } from "../db/schema";

export const promotionSelectFields = {
  // promotion fields
  id: promotions.id,
  promotionName: promotions.promotionName,
  promotionTypeId: promotions.promotionTypeId,
  status: promotions.status,
  dateRange: promotions.dateRange,
  minimumDepositAmount: promotions.minimumDepositAmount,
  maximumDepositAmount: promotions.maximumDepositAmount,
  turnoverMultiply: promotions.turnoverMultiply,
  bannerImg: promotions.bannerImg,
  bonus: promotions.bonus,
  description: promotions.description,
  createdBy: promotions.createdBy,
  createdAt: promotions.createdAt,

  // dropdownOptions fields aliased
  promotionTypeTitle: dropdownOptions.title,
  promotionTypeDropdownId: dropdownOptions.dropdown_id,
  promotionTypeStatus: dropdownOptions.status,
  promotionTypeCreatedBy: dropdownOptions.created_by,
  promotionTypeCreatedAt: dropdownOptions.created_at,
};

export const promotionPublicSelectFields = {
  // promotion fields
  id: promotions.id,
  promotionName: promotions.promotionName,
  promotionTypeId: promotions.promotionTypeId,
  dateRange: promotions.dateRange,
  minimumDepositAmount: promotions.minimumDepositAmount,
  maximumDepositAmount: promotions.maximumDepositAmount,
  turnoverMultiply: promotions.turnoverMultiply,
  bannerImg: promotions.bannerImg,
  bonus: promotions.bonus,
  description: promotions.description,
  createdAt: promotions.createdAt,

  // dropdownOptions fields aliased
  promotionTypeTitle: dropdownOptions.title,
  promotionTypeDropdownId: dropdownOptions.dropdown_id,
  promotionTypeCreatedAt: dropdownOptions.created_at,
};
