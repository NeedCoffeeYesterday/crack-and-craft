import { Thermometer, MessageSquare, Flame, Mic, MicOff } from 'lucide-react';

interface QuickActionsProps {
  onAddTemperature: () => void;
  onAddNote: () => void;
  onFirstCrack: () => void;
  onSecondCrack: () => void;
  onVoiceNote: () => void;
  isRecording: boolean;
  hasFirstCrack: boolean;
  hasSecondCrack: boolean;
}

export const QuickActions = ({
  onAddTemperature,
  onAddNote,
  onFirstCrack,
  onSecondCrack,
  onVoiceNote,
  isRecording,
  hasFirstCrack,
  hasSecondCrack,
}: QuickActionsProps) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      <button
        onClick={onAddTemperature}
        className="action-button bg-temperature/20 text-temperature hover:bg-temperature/30"
      >
        <Thermometer className="w-5 h-5" />
        <span className="text-xs font-medium">Temp</span>
      </button>

      <button
        onClick={onAddNote}
        className="action-button bg-note/20 text-note hover:bg-note/30"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-xs font-medium">Note</span>
      </button>

      <button
        onClick={onFirstCrack}
        disabled={hasFirstCrack}
        className={`action-button ${
          hasFirstCrack
            ? 'bg-first-crack/10 text-first-crack/50 cursor-not-allowed'
            : 'bg-first-crack/20 text-first-crack hover:bg-first-crack/30'
        }`}
      >
        <Flame className="w-5 h-5" />
        <span className="text-xs font-medium">1st</span>
      </button>

      <button
        onClick={onSecondCrack}
        disabled={hasSecondCrack}
        className={`action-button ${
          hasSecondCrack
            ? 'bg-second-crack/10 text-second-crack/50 cursor-not-allowed'
            : 'bg-second-crack/20 text-second-crack hover:bg-second-crack/30'
        }`}
      >
        <Flame className="w-5 h-5" />
        <span className="text-xs font-medium">2nd</span>
      </button>

      <button
        onClick={onVoiceNote}
        className={`action-button ${
          isRecording
            ? 'bg-destructive/20 text-destructive animate-recording-pulse'
            : 'bg-voice/20 text-voice hover:bg-voice/30'
        }`}
      >
        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        <span className="text-xs font-medium">{isRecording ? 'Stop' : 'Voice'}</span>
      </button>
    </div>
  );
};
