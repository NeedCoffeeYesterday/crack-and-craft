 export type DataPointType = 'temperature' | 'note' | 'first-crack' | 'second-crack' | 'voice' | 'charge' | 'custom' | 'drum-speed' | 'fan-speed' | 'speed';

export interface DataPoint {
  id: string;
  timestamp: number; // seconds from start
  type: DataPointType;
  temperature?: number;
  note?: string;
  voiceNote?: string; // base64 audio data (web) or file URI (native)
  voiceNoteUri?: string; // file URI for native recordings
  customButtonId?: string; // for custom markers
   speedValue?: number; // for speed data points
   speedUnit?: 'rpm' | '%' | ''; // unit for speed
}

export interface GreenCoffee {
  id: string;
  name: string;
  origin?: string;
  altitude?: string;
  processingMethod?: string;
  purchaseDate?: string;
  flavourNotes?: string;
}

 export type CustomButtonType = 'marker' | 'temperature' | 'speed';

export interface CustomButton {
  id: string;
  name: string;
  shortName: string; // 3-4 char display
  type: CustomButtonType;
  color: string; // HSL values
  enabled: boolean;
  isBuiltIn: boolean;
   speedUnit?: 'rpm' | '%' | ''; // for speed type buttons
}

export interface RoastSettings {
  buttons: CustomButton[];
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
   greenWeight?: number; // grams
   roastedWeight?: number; // grams
   weightLossPercent?: number; // calculated: ((green - roasted) / green) * 100
}

export interface RoastState {
  isRoasting: boolean;
  isPaused: boolean;
  elapsedTime: number;
  currentRoast: Roast | null;
}
