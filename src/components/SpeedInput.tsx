import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface SpeedInputProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (speed: number) => void;
  timestamp: number;
  label: string;
}

export const SpeedInput = ({ open, onClose, onSubmit, timestamp, label }: SpeedInputProps) => {
  const [speed, setSpeed] = useState(50);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    onSubmit(speed);
    onClose();
  };

  const adjustSpeed = (delta: number) => {
    setSpeed(prev => Math.max(0, Math.min(100, prev + delta)));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs mx-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center">
            {label}
            <span className="block text-sm font-normal text-muted-foreground mt-1">
              at {formatTime(timestamp)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => adjustSpeed(-5)}
            >
              <Minus className="w-5 h-5" />
            </Button>

            <div className="w-32 text-center">
              <input
                type="number"
                value={speed}
                onChange={(e) => setSpeed(Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-full text-center temperature-value bg-transparent border-none focus:outline-none focus:ring-0 text-primary"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => adjustSpeed(5)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
