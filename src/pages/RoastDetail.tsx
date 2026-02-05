import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Roast, DataPoint } from '@/types/roast';
import { getRoastById, saveRoast, deleteRoast, getSettings } from '@/lib/storage';
import { RoastGraph } from '@/components/RoastGraph';
import { DataPointDetail } from '@/components/DataPointDetail';
import { CoffeeDetails } from '@/components/CoffeeDetails';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Coffee, Clock, Thermometer, Flame, Trash2, Scale, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const RoastDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [roast, setRoast] = useState<Roast | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const settings = getSettings();

  const getPointLabel = (point: DataPoint) => {
    if (point.type === 'custom' && point.customButtonId) {
      const button = settings.buttons.find(b => b.id === point.customButtonId);
      return button?.name || 'Custom';
    }
    switch (point.type) {
      case 'first-crack': return '1st Crack';
      case 'second-crack': return '2nd Crack';
      case 'charge': return 'Charge';
      default: return point.type.charAt(0).toUpperCase() + point.type.slice(1);
    }
  };

  const getPointColor = (point: DataPoint) => {
    if (point.type === 'custom' && point.customButtonId) {
      const button = settings.buttons.find(b => b.id === point.customButtonId);
      return button ? `hsl(${button.color})` : undefined;
    }
    return undefined;
  };

  useEffect(() => {
    if (id) {
      const foundRoast = getRoastById(id);
      if (foundRoast) {
        setRoast(foundRoast);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePointClick = (point: DataPoint) => {
    setSelectedPoint(point);
  };

  const handleUpdatePoint = (pointId: string, updates: Partial<DataPoint>) => {
    if (!roast) return;
    
    const updatedRoast = {
      ...roast,
      dataPoints: roast.dataPoints.map(p =>
        p.id === pointId ? { ...p, ...updates } : p
      ),
    };
    setRoast(updatedRoast);
    saveRoast(updatedRoast);
    toast.success('Updated');
  };

  const handleDeletePoint = (pointId: string) => {
    if (!roast) return;
    
    const updatedRoast = {
      ...roast,
      dataPoints: roast.dataPoints.filter(p => p.id !== pointId),
    };
    setRoast(updatedRoast);
    saveRoast(updatedRoast);
    toast.success('Deleted');
  };

  const handleDeleteRoast = () => {
    if (id) {
      deleteRoast(id);
      toast.success('Roast deleted');
      navigate('/');
    }
  };

  if (!roast) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const getMaxTemp = () => {
    const temps = roast.dataPoints
      .filter(dp => dp.type === 'temperature' && dp.temperature)
      .map(dp => dp.temperature!);
    return temps.length > 0 ? Math.max(...temps) : null;
  };

  const firstCrack = roast.dataPoints.find(dp => dp.type === 'first-crack');
  const secondCrack = roast.dataPoints.find(dp => dp.type === 'second-crack');
  const maxTemp = getMaxTemp();

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      {/* AdMob Banner Space - Reserved for native ads */}
      <div className="h-14 bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
        AdMob Banner Space
      </div>

      {/* Header */}
      <header className="sticky top-14 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border max-w-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Roast?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this roast and all its data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteRoast} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Roast Info with Coffee Details */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Coffee className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <CoffeeDetails coffeeId={roast.coffeeId} coffeeName={roast.coffeeName} />
              <p className="text-sm text-muted-foreground mt-2">{formatDate(roast.startTime)}</p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Duration</span>
            </div>
            <p className="text-lg font-semibold font-mono">{formatDuration(roast.duration)}</p>
          </Card>

          {maxTemp && (
            <Card className="p-4">
              <div className="flex items-center gap-2 text-temperature mb-1">
                <Thermometer className="w-4 h-4" />
                <span className="text-sm">Max Temp</span>
              </div>
              <p className="text-lg font-semibold font-mono text-temperature">{maxTemp}°C</p>
            </Card>
          )}

          {firstCrack && (
            <Card className="p-4">
              <div className="flex items-center gap-2 text-first-crack mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-sm">1st Crack</span>
              </div>
              <p className="text-lg font-semibold font-mono text-first-crack">
                {formatTime(firstCrack.timestamp)}
              </p>
            </Card>
          )}

          {secondCrack && (
            <Card className="p-4">
              <div className="flex items-center gap-2 text-second-crack mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-sm">2nd Crack</span>
              </div>
              <p className="text-lg font-semibold font-mono text-second-crack">
                {formatTime(secondCrack.timestamp)}
              </p>
            </Card>
          )}

           {roast.greenWeight && (
             <Card className="p-4">
               <div className="flex items-center gap-2 text-muted-foreground mb-1">
                 <Scale className="w-4 h-4" />
                 <span className="text-sm">Green Weight</span>
               </div>
               <p className="text-lg font-semibold font-mono">{roast.greenWeight}g</p>
             </Card>
           )}

           {roast.roastedWeight && (
             <Card className="p-4">
               <div className="flex items-center gap-2 text-muted-foreground mb-1">
                 <Scale className="w-4 h-4" />
                 <span className="text-sm">Roasted Weight</span>
               </div>
               <p className="text-lg font-semibold font-mono">{roast.roastedWeight}g</p>
             </Card>
           )}

           {roast.weightLossPercent !== undefined && (
             <Card className="p-4 bg-primary/5 border-primary/20">
               <div className="flex items-center gap-2 text-primary mb-1">
                 <TrendingDown className="w-4 h-4" />
                 <span className="text-sm">Weight Loss</span>
               </div>
               <p className="text-lg font-semibold font-mono text-primary">
                 {roast.weightLossPercent.toFixed(1)}%
               </p>
             </Card>
           )}
        </div>

        {/* Graph */}
        <RoastGraph
          dataPoints={roast.dataPoints}
          onPointClick={handlePointClick}
        />

        {/* All Data Points */}
        {roast.dataPoints.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Timeline</h2>
            <div className="space-y-2">
              {roast.dataPoints
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((point) => (
                  <Card
                    key={point.id}
                    className="p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => handlePointClick(point)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-muted-foreground w-12">
                          {formatTime(point.timestamp)}
                        </span>
                        <span 
                          className={`
                            px-2 py-0.5 text-xs font-medium rounded-full
                            ${point.type === 'temperature' ? 'bg-temperature/20 text-temperature' : ''}
                            ${point.type === 'note' ? 'bg-note/20 text-note' : ''}
                            ${point.type === 'voice' ? 'bg-voice/20 text-voice' : ''}
                            ${point.type === 'first-crack' ? 'bg-first-crack/20 text-first-crack' : ''}
                            ${point.type === 'second-crack' ? 'bg-second-crack/20 text-second-crack' : ''}
                            ${point.type === 'charge' ? 'bg-primary/20 text-primary' : ''}
                            ${point.type === 'custom' ? 'rounded-full' : ''}
                          `}
                          style={point.type === 'custom' ? { 
                            backgroundColor: `${getPointColor(point)}20`, 
                            color: getPointColor(point) 
                          } : undefined}
                        >
                          {getPointLabel(point)}
                        </span>
                      </div>
                      {point.temperature && (
                        <span className="font-mono text-temperature">{point.temperature}°</span>
                      )}
                      {point.note && (
                        <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                          {point.note}
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
            </div>
          </section>
        )}
      </main>

      <DataPointDetail
        dataPoint={selectedPoint}
        open={!!selectedPoint}
        onClose={() => setSelectedPoint(null)}
        onUpdate={handleUpdatePoint}
        onDelete={handleDeletePoint}
      />
    </div>
  );
};

export default RoastDetail;
