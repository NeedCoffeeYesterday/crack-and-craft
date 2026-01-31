import { useState } from 'react';
import { GreenCoffee } from '@/types/roast';
import { getGreenCoffees, saveGreenCoffee, generateId } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Coffee, Check, ChevronDown, ChevronUp, Pencil } from 'lucide-react';

interface CoffeeSelectorProps {
  selectedCoffee: GreenCoffee | null;
  onSelect: (coffee: GreenCoffee) => void;
}

export const CoffeeSelector = ({ selectedCoffee, onSelect }: CoffeeSelectorProps) => {
  const [coffees, setCoffees] = useState<GreenCoffee[]>(getGreenCoffees());
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedCoffeeId, setExpandedCoffeeId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<GreenCoffee>>({
    name: '',
    origin: '',
    altitude: '',
    processingMethod: '',
    purchaseDate: '',
    flavourNotes: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      origin: '',
      altitude: '',
      processingMethod: '',
      purchaseDate: '',
      flavourNotes: '',
    });
  };

  const handleAddCoffee = () => {
    if (formData.name?.trim()) {
      const newCoffee: GreenCoffee = {
        id: generateId(),
        name: formData.name.trim(),
        origin: formData.origin?.trim() || undefined,
        altitude: formData.altitude?.trim() || undefined,
        processingMethod: formData.processingMethod?.trim() || undefined,
        purchaseDate: formData.purchaseDate || undefined,
        flavourNotes: formData.flavourNotes?.trim() || undefined,
      };
      saveGreenCoffee(newCoffee);
      setCoffees(getGreenCoffees());
      onSelect(newCoffee);
      resetForm();
      setIsAdding(false);
    }
  };

  const handleEditCoffee = (coffee: GreenCoffee) => {
    setFormData(coffee);
    setIsEditing(true);
    setIsAdding(true);
    setExpandedCoffeeId(null);
  };

  const handleUpdateCoffee = () => {
    if (formData.id && formData.name?.trim()) {
      const updatedCoffee: GreenCoffee = {
        id: formData.id,
        name: formData.name.trim(),
        origin: formData.origin?.trim() || undefined,
        altitude: formData.altitude?.trim() || undefined,
        processingMethod: formData.processingMethod?.trim() || undefined,
        purchaseDate: formData.purchaseDate || undefined,
        flavourNotes: formData.flavourNotes?.trim() || undefined,
      };
      saveGreenCoffee(updatedCoffee);
      setCoffees(getGreenCoffees());
      if (selectedCoffee?.id === updatedCoffee.id) {
        onSelect(updatedCoffee);
      }
      resetForm();
      setIsAdding(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsAdding(false);
    setIsEditing(false);
  };

  const toggleExpand = (coffeeId: string) => {
    setExpandedCoffeeId(expandedCoffeeId === coffeeId ? null : coffeeId);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Select Green Coffee</h3>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetForm();
              setIsEditing(false);
              setIsAdding(true);
            }}
            className="text-primary hover:text-primary/80"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add New
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="space-y-3 p-4 bg-secondary/50 rounded-lg border border-border">
          <div className="space-y-2">
            <Label htmlFor="coffee-name">Name *</Label>
            <Input
              id="coffee-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Ethiopia Yirgacheffe"
              className="bg-background border-border"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="coffee-origin">Origin</Label>
              <Input
                id="coffee-origin"
                value={formData.origin || ''}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                placeholder="Country / Region"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coffee-altitude">Altitude</Label>
              <Input
                id="coffee-altitude"
                value={formData.altitude || ''}
                onChange={(e) => setFormData({ ...formData, altitude: e.target.value })}
                placeholder="e.g., 1800-2000m"
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coffee-processing">Processing Method</Label>
            <Input
              id="coffee-processing"
              value={formData.processingMethod || ''}
              onChange={(e) => setFormData({ ...formData, processingMethod: e.target.value })}
              placeholder="e.g., Washed, Natural, Honey"
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coffee-purchase-date">Purchase Date</Label>
            <Input
              id="coffee-purchase-date"
              type="date"
              value={formData.purchaseDate || ''}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coffee-flavour">Flavour Notes</Label>
            <Textarea
              id="coffee-flavour"
              value={formData.flavourNotes || ''}
              onChange={(e) => setFormData({ ...formData, flavourNotes: e.target.value })}
              placeholder="e.g., Blueberry, jasmine, citrus brightness..."
              className="bg-background border-border min-h-[80px]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={isEditing ? handleUpdateCoffee : handleAddCoffee}
              disabled={!formData.name?.trim()}
              className="flex-1"
            >
              {isEditing ? 'Update' : 'Add Coffee'}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {coffees.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No coffees added yet. Add your first green coffee above.
          </p>
        ) : (
          coffees.map((coffee) => (
            <div key={coffee.id} className="space-y-0">
              <button
                onClick={() => onSelect(coffee)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                  selectedCoffee?.id === coffee.id
                    ? 'bg-primary/15 border border-primary'
                    : 'bg-secondary hover:bg-secondary/80 border border-transparent'
                }`}
              >
                <Coffee className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium block truncate">{coffee.name}</span>
                  {coffee.origin && (
                    <span className="text-xs text-muted-foreground">{coffee.origin}</span>
                  )}
                </div>
                {selectedCoffee?.id === coffee.id && (
                  <Check className="w-5 h-5 text-primary shrink-0" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCoffee(coffee);
                  }}
                  className="p-1.5 rounded-md hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(coffee.id);
                  }}
                  className="p-1.5 rounded-md hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedCoffeeId === coffee.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </button>

              {expandedCoffeeId === coffee.id && (
                <div className="ml-8 p-3 bg-muted/50 rounded-lg text-sm space-y-1 border-l-2 border-primary/30">
                  {coffee.origin && (
                    <p><span className="text-muted-foreground">Origin:</span> {coffee.origin}</p>
                  )}
                  {coffee.altitude && (
                    <p><span className="text-muted-foreground">Altitude:</span> {coffee.altitude}</p>
                  )}
                  {coffee.processingMethod && (
                    <p><span className="text-muted-foreground">Process:</span> {coffee.processingMethod}</p>
                  )}
                  {coffee.purchaseDate && (
                    <p><span className="text-muted-foreground">Purchased:</span> {formatDate(coffee.purchaseDate)}</p>
                  )}
                  {coffee.flavourNotes && (
                    <p><span className="text-muted-foreground">Flavours:</span> {coffee.flavourNotes}</p>
                  )}
                  {!coffee.origin && !coffee.altitude && !coffee.processingMethod && !coffee.purchaseDate && !coffee.flavourNotes && (
                    <p className="text-muted-foreground italic">No additional details</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
