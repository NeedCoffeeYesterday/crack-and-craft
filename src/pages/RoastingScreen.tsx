import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Roast, DataPoint, CustomButton } from '@/types/roast';
import { saveRoast, generateId, getSettings } from '@/lib/storage';
import { useRoastTimer } from '@/hooks/useRoastTimer';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { RoastGraph } from '@/components/RoastGraph';
import { QuickActions } from '@/components/QuickActions';
import { TemperatureInput } from '@/components/TemperatureInput';
import { NoteInput } from '@/components/NoteInput';
import { DataPointDetail } from '@/components/DataPointDetail';
 import { SpeedInput } from '@/components/SpeedInput';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, Square, Coffee, Settings } from 'lucide-react';
import { toast } from 'sonner';

const RoastingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRoast = location.state?.roast as Roast | undefined;

  const [roast, setRoast] = useState<Roast | null>(initialRoast || null);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [showTempInput, setShowTempInput] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
   const [showSpeedInput, setShowSpeedInput] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [pendingTempButton, setPendingTempButton] = useState<CustomButton | null>(null);
   const [pendingSpeedButton, setPendingSpeedButton] = useState<CustomButton | null>(null);
  const [settings] = useState(getSettings());

  const timer = useRoastTimer();
  const voiceRecorder = useVoiceRecorder();

  useEffect(() => {
    if (!initialRoast) {
      navigate('/');
    }
  }, [initialRoast, navigate]);

  const addDataPoint = useCallback((point: Omit<DataPoint, 'id'>) => {
    const newPoint: DataPoint = {
      ...point,
      id: generateId(),
    };
    setDataPoints(prev => [...prev, newPoint]);
  }, []);

  const handleStart = () => {
    timer.start();
    setHasStarted(true);
  };

  const handlePauseResume = () => {
    if (timer.isRunning) {
      timer.pause();
    } else {
      timer.resume();
    }
  };

  const handleStop = () => {
    timer.stop();
    
    if (roast) {
      const completedRoast: Roast = {
        ...roast,
        endTime: new Date(),
        duration: timer.elapsedTime,
        dataPoints,
      };
      saveRoast(completedRoast);
      toast.success('Roast saved!');
      navigate(`/roast/${roast.id}`);
    }
  };

  const handleAddTemperature = (temperature: number) => {
    // Determine the data point type based on the button
    let type: DataPoint['type'];
    if (pendingTempButton?.id === 'charge') {
      type = 'charge';
    } else if (pendingTempButton?.isBuiltIn) {
      type = 'temperature';
    } else {
      type = 'custom'; // Custom temperature buttons use 'custom' type
    }
    
    addDataPoint({
      timestamp: timer.elapsedTime,
      type,
      temperature,
      customButtonId: pendingTempButton?.isBuiltIn ? undefined : pendingTempButton?.id,
    });
    
    const label = pendingTempButton?.id === 'charge' 
      ? 'Charge temp' 
      : pendingTempButton?.isBuiltIn 
        ? `${temperature}°C` 
        : `${pendingTempButton?.name}: ${temperature}°C`;
    toast.success(`${label} logged`);
    setPendingTempButton(null);
  };
 
   const handleAddSpeed = (value: number) => {
     let type: DataPoint['type'];
     if (pendingSpeedButton?.id === 'drum-speed') {
       type = 'drum-speed';
     } else if (pendingSpeedButton?.id === 'fan-speed') {
       type = 'fan-speed';
     } else {
       type = 'speed'; // Custom speed buttons use 'speed' type
     }
     
     const unit = pendingSpeedButton?.speedUnit || '';
     
     addDataPoint({
       timestamp: timer.elapsedTime,
       type,
       speedValue: value,
       speedUnit: unit,
       customButtonId: pendingSpeedButton?.isBuiltIn ? undefined : pendingSpeedButton?.id,
     });
     
     const unitDisplay = unit === 'rpm' ? ' RPM' : unit === '%' ? '%' : '';
     const label = pendingSpeedButton?.isBuiltIn 
       ? `${pendingSpeedButton?.name}: ${value}${unitDisplay}` 
       : `${pendingSpeedButton?.name}: ${value}${unitDisplay}`;
     toast.success(`${label} logged`);
     setPendingSpeedButton(null);
   };

  const handleAddNote = (note: string) => {
    addDataPoint({
      timestamp: timer.elapsedTime,
      type: 'note',
      note,
    });
    toast.success('Note added');
  };

  const handleVoiceNote = async () => {
    if (voiceRecorder.isRecording) {
      const result = await voiceRecorder.stopRecording();
      if (result && result.base64) {
        addDataPoint({
          timestamp: timer.elapsedTime,
          type: 'voice',
          voiceNote: result.base64,
        });
        toast.success('Voice note saved');
      } else if (voiceRecorder.error) {
        toast.error(voiceRecorder.error);
      }
    } else {
      voiceRecorder.startRecording();
      toast.info('Recording...', { duration: 1000 });
    }
  };

  const handleButtonClick = (button: CustomButton) => {
    // Handle built-in buttons
    switch (button.id) {
      case 'temp':
        setPendingTempButton(button);
        setShowTempInput(true);
        break;
      case 'charge':
        setPendingTempButton(button);
        setShowTempInput(true);
        break;
      case 'note':
        setShowNoteInput(true);
        break;
      case 'first-crack':
        addDataPoint({ timestamp: timer.elapsedTime, type: 'first-crack' });
        toast.success('First crack marked!', { icon: '🔥' });
        break;
      case 'second-crack':
        addDataPoint({ timestamp: timer.elapsedTime, type: 'second-crack' });
        toast.success('Second crack marked!', { icon: '🔥' });
        break;
      case 'voice':
        handleVoiceNote();
        break;
       case 'drum-speed':
       case 'fan-speed':
         setPendingSpeedButton(button);
         setShowSpeedInput(true);
         break;
      default:
        // Custom button
        if (button.type === 'temperature') {
          setPendingTempButton(button);
          setShowTempInput(true);
         } else if (button.type === 'speed') {
           setPendingSpeedButton(button);
           setShowSpeedInput(true);
        } else {
          addDataPoint({
            timestamp: timer.elapsedTime,
            type: 'custom',
            customButtonId: button.id,
          });
          toast.success(`${button.name} marked`);
        }
    }
  };

  const handlePointClick = (point: DataPoint) => {
    setSelectedPoint(point);
  };

  const handleUpdatePoint = (id: string, updates: Partial<DataPoint>) => {
    setDataPoints(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
    toast.success('Updated');
  };

  const handleDeletePoint = (id: string) => {
    setDataPoints(prev => prev.filter(p => p.id !== id));
    toast.success('Deleted');
  };

  if (!roast) return null;

  return (
    <div className="min-h-screen bg-background safe-area-inset flex flex-col">
      {/* AdMob Banner Space - Reserved for native ads */}
      <div className="h-14 bg-muted/30 flex items-center justify-center text-xs text-muted-foreground shrink-0">
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
            <div className="flex items-center gap-2 text-sm">
              <Coffee className="w-4 h-4 text-primary" />
              <span className="font-medium truncate max-w-[150px]">{roast.coffeeName}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-4 flex flex-col gap-4">
        {/* Timer Display */}
        <div className="text-center py-4">
          <div className="timer-display text-primary">
            {timer.formatTime(timer.elapsedTime)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {!hasStarted ? 'Ready to start' : timer.isRunning ? 'Roasting...' : 'Paused'}
          </p>
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center gap-3">
          {!hasStarted ? (
            <Button onClick={handleStart} size="lg" className="w-32">
              <Play className="w-5 h-5 mr-2" />
              Start
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePauseResume}
                variant="outline"
                size="lg"
                className="w-28"
              >
                {timer.isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Resume
                  </>
                )}
              </Button>
              <Button
                onClick={handleStop}
                variant="destructive"
                size="lg"
                className="w-28"
              >
                <Square className="w-5 h-5 mr-2" />
                End
              </Button>
            </>
          )}
        </div>

        {/* Graph */}
        <RoastGraph
          dataPoints={dataPoints}
          currentTime={hasStarted ? timer.elapsedTime : undefined}
          onPointClick={handlePointClick}
        />

        {/* Quick Actions */}
        {hasStarted && (
          <QuickActions
            buttons={settings.buttons}
            onButtonClick={handleButtonClick}
            isRecording={voiceRecorder.isRecording}
            dataPoints={dataPoints}
          />
        )}

        {/* Data Points Summary */}
        {dataPoints.length > 0 && (
          <div className="mt-auto pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              {dataPoints.filter(dp => dp.type === 'temperature' || dp.type === 'charge').length} temp readings •{' '}
              {dataPoints.filter(dp => dp.type === 'note' || dp.type === 'voice').length} notes
            </p>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <TemperatureInput
        open={showTempInput}
        onClose={() => setShowTempInput(false)}
        onSubmit={handleAddTemperature}
        timestamp={timer.elapsedTime}
      />

      <NoteInput
        open={showNoteInput}
        onClose={() => setShowNoteInput(false)}
        onSubmit={handleAddNote}
        timestamp={timer.elapsedTime}
      />
 
       <SpeedInput
         open={showSpeedInput}
         onClose={() => {
           setShowSpeedInput(false);
           setPendingSpeedButton(null);
         }}
         onSubmit={handleAddSpeed}
         timestamp={timer.elapsedTime}
         title={pendingSpeedButton?.name || 'Add Speed'}
         unit={pendingSpeedButton?.speedUnit || ''}
       />

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

export default RoastingScreen;
