export type Nutrient = {
  name: string;
  amount: number;
  unit: string;
};

export type PortionReference = {
  type: 'palma' | 'puño' | 'puñado' | 'pulgar' | 'punta';
  description: string;
  count: number;
};

export type FoodAnalysis = {
  foodItem: string;
  nutrients: Nutrient[];
  handPortions?: PortionReference[];
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
