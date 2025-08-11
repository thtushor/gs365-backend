export type statusType = "active" | "inactive";

export interface ImageObject {
  original: string;
  thumbnail: string;
}

// promotions
export interface PromotionDataType {
  promotionName: string;
  promotionTypeId: number[];
  status?: statusType; // Optional, defaults to 'inactive'
  dateRange: string;
  minimumDepositAmount: number;
  maximumDepositAmount: number;
  turnoverMultiply: number;
  bannerImg: string;
  bonus: number;
  description: string;
  createdBy: string;
}
