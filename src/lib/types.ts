export type Nutrient = {
  name: string;
  amount: number;
  unit: string;
};

export type FoodAnalysis = {
  foodItem: string;
  nutrients: Nutrient[];
  portionEstimation?: {
    type: string;
    description: string;
    amount: number;
  }[];
};

export type PortionAnalysis = {
  foodItem: string;
  estimatedWeightGrams: number;
  totalCalories: number;
  nutrients: Nutrient[];
  reasoning: string;
};

export type FoodLogItem = {
  id: string; // e.g., timestamp
  name: string;
  quantity: number; // in grams
  nutrients: Nutrient[];
  createdAt: string; // ISO string
};
