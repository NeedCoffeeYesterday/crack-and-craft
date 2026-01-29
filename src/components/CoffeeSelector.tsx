import { useState } from 'react';
import { GreenCoffee } from '@/types/roast';
import { getGreenCoffees, saveGreenCoffee, generateId } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Coffee, Check } from 'lucide-react';

interface CoffeeSelectorProps {
  selectedCoffee: GreenCoffee | null;
  onSelect: (coffee: GreenCoffee) => void;
}

export const CoffeeSelector = ({ selectedCoffee, onSelect }: CoffeeSelectorProps) => {
  const [coffees, setCoffees] = useState<GreenCoffee[]>(getGreenCoffees());
  const [newCoffeeName, setNewCoffeeName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCoffee = () => {
    if (newCoffeeName.trim()) {
      const newCoffee: GreenCoffee = {
        id: generateId(),
        name: newCoffeeName.trim(),
      };
      saveGreenCoffee(newCoffee);
      setCoffees(getGreenCoffees());
      onSelect(newCoffee);
      setNewCoffeeName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Select Green Coffee</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="text-primary hover:text-primary/80"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add New
        </Button>
      </div>

      {isAdding && (
        <div className="flex gap-2">
          <Input
            value={newCoffeeName}
            onChange={(e) => setNewCoffeeName(e.target.value)}
            placeholder="Coffee name (e.g., Ethiopia Yirgacheffe)"
            className="bg-input border-border"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAddCoffee()}
          />
          <Button onClick={handleAddCoffee} disabled={!newCoffeeName.trim()}>
            Add
          </Button>
        </div>
      )}

      <div className="grid gap-2 max-h-48 overflow-y-auto">
        {coffees.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No coffees added yet. Add your first green coffee above.
          </p>
        ) : (
          coffees.map((coffee) => (
            <button
              key={coffee.id}
              onClick={() => onSelect(coffee)}
              className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                selectedCoffee?.id === coffee.id
                  ? 'bg-primary/20 border border-primary'
                  : 'bg-secondary hover:bg-secondary/80 border border-transparent'
              }`}
            >
              <Coffee className="w-5 h-5 text-primary shrink-0" />
              <span className="flex-1 font-medium truncate">{coffee.name}</span>
              {selectedCoffee?.id === coffee.id && (
                <Check className="w-5 h-5 text-primary shrink-0" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
