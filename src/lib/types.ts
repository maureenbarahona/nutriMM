export type Nutrient = {
  name: string;
  amount: number;
  unit: string;
};

export type FoodAnalysis = {
  foodItem: string;
  nutrients: Nutrient[];
};

export type FoodLogItem = {
  id: string; // e.g., timestamp
  name: string;
  quantity: number; // in grams
  nutrients: Nutrient[];
  createdAt: string; // ISO string
};
