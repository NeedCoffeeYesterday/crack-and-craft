import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Roast, GreenCoffee } from '@/types/roast';
import { getRoasts, generateId, updateCoffeeInventory, getCoffeeById } from '@/lib/storage';
import { RoastCard } from '@/components/RoastCard';
import { CoffeeSelector } from '@/components/CoffeeSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SupportDialog } from '@/components/SupportDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coffee, Flame, Plus, Settings, Scale, Calendar } from 'lucide-react';
import { toast } from 'sonner';


const Index = () => {
  const navigate = useNavigate();
  const [roasts, setRoasts] = useState<Roast[]>([]);
  const [selectedCoffee, setSelectedCoffee] = useState<GreenCoffee | null>(null);
  const [showCoffeeSelector, setShowCoffeeSelector] = useState(false);
   const [greenWeight, setGreenWeight] = useState<string>('');

  useEffect(() => {
    setRoasts(getRoasts());
  }, []);

  const handleStartRoast = () => {
    if (!selectedCoffee) {
      setShowCoffeeSelector(true);
      return;
    }

    const parsedWeight = greenWeight ? parseFloat(greenWeight) : undefined;
    const weightToUse = parsedWeight && parsedWeight > 0 ? parsedWeight : undefined;

    // Deduct from inventory if green weight is entered
    if (weightToUse && selectedCoffee.inventory !== undefined) {
      const updatedCoffee = updateCoffeeInventory(selectedCoffee.id, weightToUse);
      if (updatedCoffee) {
        // Check for low stock alert
        if (updatedCoffee.lowStockAlertEnabled && 
            updatedCoffee.lowStockThreshold && 
            updatedCoffee.inventory !== undefined &&
            updatedCoffee.inventory <= updatedCoffee.lowStockThreshold) {
          toast.warning(`Low stock alert: ${updatedCoffee.name} is running low (${updatedCoffee.inventory}g remaining)`, {
            duration: 5000,
          });
        }
      }
    }
 
    const newRoast: Roast = {
      id: generateId(),
      coffeeId: selectedCoffee.id,
      coffeeName: selectedCoffee.name,
      startTime: new Date(),
      dataPoints: [],
      greenWeight: weightToUse,
    };

    navigate('/roast', { state: { roast: newRoast } });
  };

  const handleViewRoast = (roast: Roast) => {
    navigate(`/roast/${roast.id}`);
  };

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      {/* AdMob Banner Space - Reserved for native ads */}
      <div className="h-14 bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
        AdMob Banner Space
      </div>

      {/* Header */}
      <header className="sticky top-14 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container py-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <ThemeToggle iconSize={22} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                className="text-muted-foreground hover:text-foreground h-10 w-10"
              >
                <Settings className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/calendar')}
                className="text-muted-foreground hover:text-foreground h-10 w-10"
              >
                <Calendar className="w-6 h-6" />
              </Button>
            </div>
            <div className="flex-1 flex flex-col justify-center items-start pl-4">
              <h1 className="text-xl font-bold text-foreground">Roast Log</h1>
              <p className="text-sm text-muted-foreground">Coffee roasting companion</p>
            </div>
            <div className="flex flex-col items-end justify-start">
              <SupportDialog />
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Coffee Selection */}
        <Card className="p-4">
          {selectedCoffee ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Coffee className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Selected Coffee</p>
                  <p className="font-semibold">{selectedCoffee.name}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCoffeeSelector(!showCoffeeSelector)}
              >
                Change
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-3"
              onClick={() => setShowCoffeeSelector(!showCoffeeSelector)}
            >
              <Plus className="w-4 h-4" />
              Select a green coffee to roast
            </Button>
          )}

          {showCoffeeSelector && (
            <div className="mt-4 pt-4 border-t border-border">
              <CoffeeSelector
                selectedCoffee={selectedCoffee}
                onSelect={(coffee) => {
                  setSelectedCoffee(coffee);
                  setShowCoffeeSelector(false);
                }}
              />
            </div>
          )}
        </Card>
 
         {/* Green Weight Input */}
         {selectedCoffee && (
           <Card className="p-4">
             <div className="flex items-center gap-3">
               <Scale className="w-5 h-5 text-primary shrink-0" />
               <div className="flex-1">
                 <Label htmlFor="green-weight" className="text-sm text-muted-foreground">
                   Green Weight (optional)
                 </Label>
                 <div className="flex items-center gap-2 mt-1">
                   <Input
                     id="green-weight"
                     type="number"
                     placeholder="Enter weight"
                     value={greenWeight}
                     onChange={(e) => setGreenWeight(e.target.value)}
                     className="flex-1"
                     min="0"
                     step="0.1"
                   />
                   <span className="text-sm text-muted-foreground font-medium">g</span>
                 </div>
               </div>
             </div>
           </Card>
         )}

        {/* Start Roast Button */}
        <Button
          onClick={handleStartRoast}
          size="lg"
          className="w-full h-14 text-lg font-semibold animate-pulse-glow"
        >
          <Flame className="w-5 h-5 mr-2" />
          Start Roast
        </Button>

        {/* Past Roasts */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Past Roasts</h2>
          
          {roasts.length === 0 ? (
            <Card className="p-8 text-center">
              <Coffee className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No roasts yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start your first roast to see it here
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {roasts.map((roast) => (
                <RoastCard
                  key={roast.id}
                  roast={roast}
                  onClick={() => handleViewRoast(roast)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
