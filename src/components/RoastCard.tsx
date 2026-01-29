import { Roast } from '@/types/roast';
import { Card } from '@/components/ui/card';
import { Coffee, Clock, Flame, Thermometer } from 'lucide-react';

interface RoastCardProps {
  roast: Roast;
  onClick: () => void;
}

export const RoastCard = ({ roast, onClick }: RoastCardProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMaxTemp = () => {
    const temps = roast.dataPoints
      .filter(dp => dp.type === 'temperature' && dp.temperature)
      .map(dp => dp.temperature!);
    return temps.length > 0 ? Math.max(...temps) : null;
  };

  const hasFirstCrack = roast.dataPoints.some(dp => dp.type === 'first-crack');
  const hasSecondCrack = roast.dataPoints.some(dp => dp.type === 'second-crack');
  const maxTemp = getMaxTemp();

  return (
    <Card
      onClick={onClick}
      className="p-4 cursor-pointer transition-all duration-200 hover:bg-secondary/50 active:scale-[0.98] touch-manipulation"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Coffee className="w-4 h-4 text-primary shrink-0" />
            <h3 className="font-semibold text-foreground truncate">
              {roast.coffeeName}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(roast.startTime)}
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatDuration(roast.duration)}</span>
          </div>
          {maxTemp && (
            <div className="flex items-center gap-1 text-temperature">
              <Thermometer className="w-4 h-4" />
              <span className="font-mono">{maxTemp}°</span>
            </div>
          )}
        </div>
      </div>

      {(hasFirstCrack || hasSecondCrack) && (
        <div className="flex gap-2 mt-3">
          {hasFirstCrack && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-first-crack/20 text-first-crack">
              1st Crack
            </span>
          )}
          {hasSecondCrack && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-second-crack/20 text-second-crack">
              2nd Crack
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
