import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Roast, DataPoint } from '@/types/roast';
import { saveRoast, generateId } from '@/lib/storage';
import { useRoastTimer } from '@/hooks/useRoastTimer';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { RoastGraph } from '@/components/RoastGraph';
import { QuickActions } from '@/components/QuickActions';
import { TemperatureInput } from '@/components/TemperatureInput';
import { NoteInput } from '@/components/NoteInput';
import { DataPointDetail } from '@/components/DataPointDetail';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, Square, Coffee } from 'lucide-react';
import { toast } from 'sonner';

const RoastingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRoast = location.state?.roast as Roast | undefined;

  const [roast, setRoast] = useState<Roast | null>(initialRoast || null);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [showTempInput, setShowTempInput] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

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
    addDataPoint({
      timestamp: timer.elapsedTime,
      type: 'temperature',
      temperature,
    });
    toast.success(`${temperature}°C logged`);
  };

  const handleAddNote = (note: string) => {
    addDataPoint({
      timestamp: timer.elapsedTime,
      type: 'note',
      note,
    });
    toast.success('Note added');
  };

  const handleFirstCrack = () => {
    addDataPoint({
      timestamp: timer.elapsedTime,
      type: 'first-crack',
    });
    toast.success('First crack marked!', { icon: '🔥' });
  };

  const handleSecondCrack = () => {
    addDataPoint({
      timestamp: timer.elapsedTime,
      type: 'second-crack',
    });
    toast.success('Second crack marked!', { icon: '🔥' });
  };

  const handleVoiceNote = async () => {
    if (voiceRecorder.isRecording) {
      const audioData = await voiceRecorder.stopRecording();
      if (audioData) {
        addDataPoint({
          timestamp: timer.elapsedTime,
          type: 'voice',
          voiceNote: audioData,
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

  const hasFirstCrack = dataPoints.some(dp => dp.type === 'first-crack');
  const hasSecondCrack = dataPoints.some(dp => dp.type === 'second-crack');

  if (!roast) return null;

  return (
    <div className="min-h-screen bg-background safe-area-inset flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
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
            onAddTemperature={() => setShowTempInput(true)}
            onAddNote={() => setShowNoteInput(true)}
            onFirstCrack={handleFirstCrack}
            onSecondCrack={handleSecondCrack}
            onVoiceNote={handleVoiceNote}
            isRecording={voiceRecorder.isRecording}
            hasFirstCrack={hasFirstCrack}
            hasSecondCrack={hasSecondCrack}
          />
        )}

        {/* Data Points Summary */}
        {dataPoints.length > 0 && (
          <div className="mt-auto pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              {dataPoints.filter(dp => dp.type === 'temperature').length} temp readings •{' '}
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
