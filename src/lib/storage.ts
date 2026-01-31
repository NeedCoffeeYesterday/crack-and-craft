import { z } from 'zod';
import { Roast, GreenCoffee, DataPoint } from '@/types/roast';

const ROASTS_KEY = 'coffee_roasts';
const COFFEES_KEY = 'green_coffees';

// Zod schemas for validation
const DataPointSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  type: z.enum(['temperature', 'note', 'first-crack', 'second-crack', 'voice']),
  temperature: z.number().optional(),
  note: z.string().optional(),
  voiceNote: z.string().optional(),
});

const RoastSchema = z.object({
  id: z.string(),
  coffeeId: z.string(),
  coffeeName: z.string(),
  startTime: z.string(),
  endTime: z.string().optional().nullable(),
  duration: z.number().optional(),
  dataPoints: z.array(DataPointSchema),
  notes: z.string().optional(),
});

const GreenCoffeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  origin: z.string().optional(),
  altitude: z.string().optional(),
  purchaseDate: z.string().optional(),
  flavourNotes: z.string().optional(),
});

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
    const parsed = JSON.parse(data);
    const validated = z.array(RoastSchema).safeParse(parsed);
    
    if (!validated.success) {
      console.error('Invalid roast data in localStorage:', validated.error);
      return [];
    }
    
    return validated.data.map(r => ({
      id: r.id,
      coffeeId: r.coffeeId,
      coffeeName: r.coffeeName,
      startTime: new Date(r.startTime),
      endTime: r.endTime ? new Date(r.endTime) : undefined,
      duration: r.duration,
      dataPoints: r.dataPoints as DataPoint[],
      notes: r.notes,
    }));
  } catch {
    console.error('Failed to parse roast data from localStorage');
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
    const parsed = JSON.parse(data);
    const validated = z.array(GreenCoffeeSchema).safeParse(parsed);
    
    if (!validated.success) {
      console.error('Invalid coffee data in localStorage:', validated.error);
      return [];
    }
    
    return validated.data.map(c => ({
      id: c.id,
      name: c.name,
      origin: c.origin,
      altitude: c.altitude,
      purchaseDate: c.purchaseDate,
      flavourNotes: c.flavourNotes,
    }));
  } catch {
    console.error('Failed to parse coffee data from localStorage');
    return [];
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
