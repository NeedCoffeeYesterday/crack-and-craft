import { GreenCoffee } from '@/types/roast';
import { getGreenCoffees } from '@/lib/storage';
import { MapPin, Mountain, Calendar, Sparkles } from 'lucide-react';

interface CoffeeDetailsProps {
  coffeeId: string;
  coffeeName: string;
  compact?: boolean;
}

export const CoffeeDetails = ({ coffeeId, coffeeName, compact = false }: CoffeeDetailsProps) => {
  const coffees = getGreenCoffees();
  const coffee = coffees.find(c => c.id === coffeeId);

  if (!coffee) {
    return <span className="font-semibold">{coffeeName}</span>;
  }

  const hasDetails = coffee.origin || coffee.altitude || coffee.purchaseDate || coffee.flavourNotes;

  if (compact) {
    return (
      <div>
        <span className="font-semibold">{coffee.name}</span>
        {coffee.origin && (
          <span className="text-xs text-muted-foreground ml-2">• {coffee.origin}</span>
        )}
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">{coffee.name}</h2>
      
      {hasDetails && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          {coffee.origin && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{coffee.origin}</span>
            </div>
          )}
          {coffee.altitude && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mountain className="w-4 h-4 text-primary" />
              <span>{coffee.altitude}</span>
            </div>
          )}
          {coffee.purchaseDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{formatDate(coffee.purchaseDate)}</span>
            </div>
          )}
        </div>
      )}
      
      {coffee.flavourNotes && (
        <div className="flex items-start gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-muted-foreground">{coffee.flavourNotes}</p>
        </div>
      )}
    </div>
  );
};
