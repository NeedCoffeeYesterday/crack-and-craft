import { z } from 'zod';
import { Roast, GreenCoffee, DataPoint, RoastSettings, CustomButton } from '@/types/roast';

const ROASTS_KEY = 'coffee_roasts';
const COFFEES_KEY = 'green_coffees';
const SETTINGS_KEY = 'roast_settings';

// Zod schemas for validation
const DataPointSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  type: z.enum(['temperature', 'note', 'first-crack', 'second-crack', 'voice', 'charge', 'custom', 'speed']),
  temperature: z.number().optional(),
  note: z.string().optional(),
  voiceNote: z.string().optional(),
  customButtonId: z.string().optional(),
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
  processingMethod: z.string().optional(),
  purchaseDate: z.string().optional(),
  flavourNotes: z.string().optional(),
});

const CustomButtonSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  type: z.enum(['marker', 'temperature', 'speed']),
  color: z.string(),
  enabled: z.boolean(),
  isBuiltIn: z.boolean(),
});

const RoastSettingsSchema = z.object({
  buttons: z.array(CustomButtonSchema),
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
      processingMethod: c.processingMethod,
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

// Default built-in buttons
const getDefaultButtons = (): CustomButton[] => [
  { id: 'temp', name: 'Temperature', shortName: 'Temp', type: 'temperature', color: '200 60% 40%', enabled: true, isBuiltIn: true },
  { id: 'note', name: 'Note', shortName: 'Note', type: 'marker', color: '270 45% 50%', enabled: true, isBuiltIn: true },
  { id: 'charge', name: 'Charge', shortName: 'Chrg', type: 'temperature', color: '35 85% 45%', enabled: true, isBuiltIn: true },
  { id: 'first-crack', name: 'First Crack', shortName: '1st', type: 'marker', color: '0 60% 45%', enabled: true, isBuiltIn: true },
  { id: 'second-crack', name: 'Second Crack', shortName: '2nd', type: 'marker', color: '30 70% 40%', enabled: false, isBuiltIn: true },
  { id: 'voice', name: 'Voice Note', shortName: 'Voice', type: 'marker', color: '150 50% 35%', enabled: true, isBuiltIn: true },
  { id: 'drum-speed', name: 'Drum Speed', shortName: 'Drum', type: 'speed', color: '280 50% 50%', enabled: false, isBuiltIn: true },
  { id: 'fan-speed', name: 'Fan Speed', shortName: 'Fan', type: 'speed', color: '190 60% 45%', enabled: false, isBuiltIn: true },
];

export const getSettings = (): RoastSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) return { buttons: getDefaultButtons() };
  
  try {
    const parsed = JSON.parse(data);
    const validated = RoastSettingsSchema.safeParse(parsed);
    
    if (!validated.success) {
      console.error('Invalid settings data in localStorage:', validated.error);
      return { buttons: getDefaultButtons() };
    }
    
    // Merge with defaults to ensure all built-in buttons exist
    const storedButtons = validated.data.buttons;
    const defaults = getDefaultButtons();
    const mergedButtons: CustomButton[] = [];
    
    // Add all default buttons with stored settings
    for (const def of defaults) {
      const stored = storedButtons.find(b => b.id === def.id);
      mergedButtons.push(stored ? { ...def, enabled: stored.enabled } : def);
    }
    
    // Add any custom buttons
    for (const stored of storedButtons) {
      if (!stored.isBuiltIn) {
        mergedButtons.push(stored as CustomButton);
      }
    }
    
    return { buttons: mergedButtons };
  } catch {
    console.error('Failed to parse settings from localStorage');
    return { buttons: getDefaultButtons() };
  }
};

export const saveSettings = (settings: RoastSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const addCustomButton = (button: Omit<CustomButton, 'id' | 'isBuiltIn'>): CustomButton => {
  const settings = getSettings();
  const newButton: CustomButton = {
    ...button,
    id: generateId(),
    isBuiltIn: false,
  };
  settings.buttons.push(newButton);
  saveSettings(settings);
  return newButton;
};

export const updateButton = (id: string, updates: Partial<CustomButton>): void => {
  const settings = getSettings();
  const index = settings.buttons.findIndex(b => b.id === id);
  if (index >= 0) {
    settings.buttons[index] = { ...settings.buttons[index], ...updates };
    saveSettings(settings);
  }
};

export const deleteCustomButton = (id: string): void => {
  const settings = getSettings();
  settings.buttons = settings.buttons.filter(b => b.id !== id || b.isBuiltIn);
  saveSettings(settings);
};
