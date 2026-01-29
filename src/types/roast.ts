export type DataPointType = 'temperature' | 'note' | 'first-crack' | 'second-crack' | 'voice';

export interface DataPoint {
  id: string;
  timestamp: number; // seconds from start
  type: DataPointType;
  temperature?: number;
  note?: string;
  voiceNote?: string; // base64 audio data
}

export interface GreenCoffee {
  id: string;
  name: string;
  origin?: string;
  process?: string;
}

export interface Roast {
  id: string;
  coffeeId: string;
  coffeeName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  dataPoints: DataPoint[];
  notes?: string;
}

export interface RoastState {
  isRoasting: boolean;
  isPaused: boolean;
  elapsedTime: number;
  currentRoast: Roast | null;
}
