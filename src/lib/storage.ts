import { Roast, GreenCoffee } from '@/types/roast';

const ROASTS_KEY = 'coffee_roasts';
const COFFEES_KEY = 'green_coffees';

export const saveRoast = (roast: Roast): void => {
  const roasts = getRoasts();
  const existingIndex = roasts.findIndex(r => r.id === roast.id);
  
  if (existingIndex >= 0) {
    roasts[existingIndex] = roast;
  } else {
    roasts.unshift(roast);
  }
  
  localStorage.setItem(ROASTS_KEY, JSON.stringify(roasts));
};

export const getRoasts = (): Roast[] => {
  const data = localStorage.getItem(ROASTS_KEY);
  if (!data) return [];
  
  try {
    const roasts = JSON.parse(data);
    return roasts.map((r: any) => ({
      ...r,
      startTime: new Date(r.startTime),
      endTime: r.endTime ? new Date(r.endTime) : undefined,
    }));
  } catch {
    return [];
  }
};

export const getRoastById = (id: string): Roast | null => {
  const roasts = getRoasts();
  return roasts.find(r => r.id === id) || null;
};

export const deleteRoast = (id: string): void => {
  const roasts = getRoasts().filter(r => r.id !== id);
  localStorage.setItem(ROASTS_KEY, JSON.stringify(roasts));
};

export const saveGreenCoffee = (coffee: GreenCoffee): void => {
  const coffees = getGreenCoffees();
  const existingIndex = coffees.findIndex(c => c.id === coffee.id);
  
  if (existingIndex >= 0) {
    coffees[existingIndex] = coffee;
  } else {
    coffees.push(coffee);
  }
  
  localStorage.setItem(COFFEES_KEY, JSON.stringify(coffees));
};

export const getGreenCoffees = (): GreenCoffee[] => {
  const data = localStorage.getItem(COFFEES_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
