import { useState, useRef, useEffect } from 'react';
import { DataPoint } from '@/types/roast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Thermometer, MessageSquare, Flame, Mic, Play, Pause, Trash2 } from 'lucide-react';

interface DataPointDetailProps {
  dataPoint: DataPoint | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<DataPoint>) => void;
  onDelete: (id: string) => void;
}

export const DataPointDetail = ({ dataPoint, open, onClose, onUpdate, onDelete }: DataPointDetailProps) => {
  const [note, setNote] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (dataPoint) {
      setNote(dataPoint.note || '');
    }
  }, [dataPoint]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="w-5 h-5 text-temperature" />;
      case 'note': return <MessageSquare className="w-5 h-5 text-note" />;
      case 'first-crack': return <Flame className="w-5 h-5 text-first-crack" />;
      case 'second-crack': return <Flame className="w-5 h-5 text-second-crack" />;
      case 'voice': return <Mic className="w-5 h-5 text-voice" />;
      default: return null;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'temperature': return 'Temperature';
      case 'note': return 'Note';
      case 'first-crack': return 'First Crack';
      case 'second-crack': return 'Second Crack';
      case 'voice': return 'Voice Note';
      default: return type;
    }
  };

  const handleSave = () => {
    if (dataPoint) {
      onUpdate(dataPoint.id, { note });
      onClose();
    }
  };

  const handleDelete = () => {
    if (dataPoint) {
      onDelete(dataPoint.id);
      onClose();
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current || !dataPoint?.voiceNote) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!dataPoint) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon(dataPoint.type)}
            {getTypeName(dataPoint.type)}
            <span className="text-sm font-normal text-muted-foreground ml-auto">
              {formatTime(dataPoint.timestamp)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {dataPoint.type === 'temperature' && dataPoint.temperature && (
            <div className="text-center">
              <span className="temperature-value text-temperature">{dataPoint.temperature}°C</span>
            </div>
          )}

          {dataPoint.voiceNote && (
            <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-voice/10">
              <audio
                ref={audioRef}
                src={dataPoint.voiceNote}
                onEnded={() => setIsPlaying(false)}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full border-voice text-voice hover:bg-voice/20"
                onClick={toggleAudio}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <span className="text-sm text-voice">Voice Note</span>
            </div>
          )}

          <div>
            <label className="text-sm text-muted-foreground block mb-2">Notes</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="min-h-[80px] bg-input border-border"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
