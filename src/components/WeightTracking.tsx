import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, TrendingDown } from 'lucide-react';

interface WeightTrackingProps {
  greenWeight?: number;
  roastedWeight?: number;
  onUpdate: (greenWeight?: number, roastedWeight?: number, weightLossPercent?: number) => void;
}

export const WeightTracking = ({ greenWeight, roastedWeight, onUpdate }: WeightTrackingProps) => {
  const [green, setGreen] = useState<string>(greenWeight?.toString() || '');
  const [roasted, setRoasted] = useState<string>(roastedWeight?.toString() || '');

  useEffect(() => {
    setGreen(greenWeight?.toString() || '');
    setRoasted(roastedWeight?.toString() || '');
  }, [greenWeight, roastedWeight]);

  const calculateLossPercent = (greenVal: number, roastedVal: number): number | undefined => {
    if (greenVal <= 0 || roastedVal <= 0) return undefined;
    if (roastedVal >= greenVal) return 0;
    return ((greenVal - roastedVal) / greenVal) * 100;
  };

  const handleGreenChange = (value: string) => {
    setGreen(value);
    const greenVal = value ? parseFloat(value) : undefined;
    const roastedVal = roasted ? parseFloat(roasted) : undefined;
    const lossPercent = greenVal && roastedVal ? calculateLossPercent(greenVal, roastedVal) : undefined;
    onUpdate(greenVal && greenVal > 0 ? greenVal : undefined, roastedVal && roastedVal > 0 ? roastedVal : undefined, lossPercent);
  };

  const handleRoastedChange = (value: string) => {
    setRoasted(value);
    const greenVal = green ? parseFloat(green) : undefined;
    const roastedVal = value ? parseFloat(value) : undefined;
    const lossPercent = greenVal && roastedVal ? calculateLossPercent(greenVal, roastedVal) : undefined;
    onUpdate(greenVal && greenVal > 0 ? greenVal : undefined, roastedVal && roastedVal > 0 ? roastedVal : undefined, lossPercent);
  };

  const greenVal = green ? parseFloat(green) : 0;
  const roastedVal = roasted ? parseFloat(roasted) : 0;
  const lossPercent = greenVal > 0 && roastedVal > 0 ? calculateLossPercent(greenVal, roastedVal) : undefined;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Weight Tracking</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Green Weight */}
        <div className="space-y-2">
          <Label htmlFor="green-weight-edit" className="text-sm text-muted-foreground">
            Green Weight
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="green-weight-edit"
              type="number"
              placeholder="--"
              value={green}
              onChange={(e) => handleGreenChange(e.target.value)}
              className="flex-1"
              min="0"
              step="0.1"
            />
            <span className="text-sm text-muted-foreground font-medium">g</span>
          </div>
        </div>

        {/* Roasted Weight */}
        <div className="space-y-2">
          <Label htmlFor="roasted-weight-edit" className="text-sm text-muted-foreground">
            Roasted Weight
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="roasted-weight-edit"
              type="number"
              placeholder="--"
              value={roasted}
              onChange={(e) => handleRoastedChange(e.target.value)}
              className="flex-1"
              min="0"
              step="0.1"
            />
            <span className="text-sm text-muted-foreground font-medium">g</span>
          </div>
        </div>
      </div>

      {/* Weight Loss Display */}
      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm font-medium">Weight Loss</span>
          </div>
          {lossPercent !== undefined ? (
            <span className="text-xl font-bold font-mono text-primary">
              {lossPercent.toFixed(1)}%
            </span>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              {!greenVal ? 'Enter green weight' : !roastedVal ? 'Enter roasted weight' : '--'}
            </span>
          )}
        </div>
        {lossPercent !== undefined && greenVal > 0 && roastedVal > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {(greenVal - roastedVal).toFixed(1)}g lost during roasting
          </p>
        )}
      </div>
    </Card>
  );
};
