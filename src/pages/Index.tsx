import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Roast, GreenCoffee } from '@/types/roast';
import { getRoasts, generateId } from '@/lib/storage';
import { RoastCard } from '@/components/RoastCard';
import { CoffeeSelector } from '@/components/CoffeeSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SupportDialog } from '@/components/SupportDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Coffee, Flame, Plus, Settings } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [roasts, setRoasts] = useState<Roast[]>([]);
  const [selectedCoffee, setSelectedCoffee] = useState<GreenCoffee | null>(null);
  const [showCoffeeSelector, setShowCoffeeSelector] = useState(false);

  useEffect(() => {
    setRoasts(getRoasts());
  }, []);

  const handleStartRoast = () => {
    if (!selectedCoffee) {
      setShowCoffeeSelector(true);
      return;
    }

    const newRoast: Roast = {
      id: generateId(),
      coffeeId: selectedCoffee.id,
      coffeeName: selectedCoffee.name,
      startTime: new Date(),
      dataPoints: [],
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
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Roast Log</h1>
                <p className="text-sm text-muted-foreground">Coffee roasting companion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <SupportDialog />
              <ThemeToggle />
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
