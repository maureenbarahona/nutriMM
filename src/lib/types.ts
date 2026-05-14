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

export type GlycemicIndexInfo = {
  value: number;
  category: 'low' | 'medium' | 'high';
  description: string;
};

export type FoodAnalysis = {
  foodItem: string;
  nutrients: Nutrient[];
  dataSource?: string;
  glycemicIndex?: GlycemicIndexInfo;
  isFromCache?: boolean;
};

export type PortionAnalysis = {
  foodItem: string;
  estimatedWeightGrams: number;
  totalCalories: number;
  nutrients: Nutrient[];
  reasoning: string;
  handPortions?: PortionReference[];
  dataSource?: string;
  glycemicIndex?: GlycemicIndexInfo;
  isFromCache?: boolean;
};

export type FoodLogItem = {
  id: string; // e.g., timestamp
  name: string;
  quantity: number; // in grams
  nutrients: Nutrient[];
  createdAt: string; // ISO string
};
