import { Thermometer, MessageSquare, Flame, Mic, MicOff, Zap } from 'lucide-react';
import { CustomButton, DataPoint } from '@/types/roast';

interface QuickActionsProps {
  buttons: CustomButton[];
  onButtonClick: (button: CustomButton) => void;
  isRecording: boolean;
  dataPoints: DataPoint[];
}

const getButtonIcon = (buttonId: string, isRecording: boolean) => {
  switch (buttonId) {
    case 'temp':
      return <Thermometer className="w-5 h-5" />;
    case 'note':
      return <MessageSquare className="w-5 h-5" />;
    case 'charge':
      return <Zap className="w-5 h-5" />;
    case 'first-crack':
    case 'second-crack':
      return <Flame className="w-5 h-5" />;
    case 'voice':
      return isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />;
    default:
      return <Flame className="w-5 h-5" />;
  }
};

export const QuickActions = ({
  buttons,
  onButtonClick,
  isRecording,
  dataPoints,
}: QuickActionsProps) => {
  const enabledButtons = buttons.filter(b => b.enabled);
  
  // Check which markers already exist (for single-use buttons like first/second crack)
  const hasFirstCrack = dataPoints.some(dp => dp.type === 'first-crack');
  const hasSecondCrack = dataPoints.some(dp => dp.type === 'second-crack');
  const hasCharge = dataPoints.some(dp => dp.type === 'charge');

  const isDisabled = (button: CustomButton) => {
    if (button.id === 'first-crack') return hasFirstCrack;
    if (button.id === 'second-crack') return hasSecondCrack;
    if (button.id === 'charge') return hasCharge;
    return false;
  };

  const getButtonStyles = (button: CustomButton) => {
    const disabled = isDisabled(button);
    const baseColor = `hsl(${button.color})`;
    
    if (button.id === 'voice' && isRecording) {
      return 'bg-destructive/20 text-destructive animate-recording-pulse';
    }
    
    if (disabled) {
      return 'opacity-50 cursor-not-allowed';
    }
    
    return '';
  };

  // Calculate grid columns based on button count
  const gridCols = enabledButtons.length <= 4 
    ? `grid-cols-${enabledButtons.length}` 
    : enabledButtons.length <= 6 
      ? 'grid-cols-3' 
      : 'grid-cols-4';

  return (
    <div className={`grid ${enabledButtons.length <= 5 ? 'grid-cols-5' : 'grid-cols-4'} gap-2`}>
      {enabledButtons.map((button) => (
        <button
          key={button.id}
          onClick={() => !isDisabled(button) && onButtonClick(button)}
          disabled={isDisabled(button)}
          className={`action-button transition-all ${getButtonStyles(button)}`}
          style={{
            backgroundColor: isDisabled(button) 
              ? `hsl(${button.color} / 0.1)` 
              : `hsl(${button.color} / 0.2)`,
            color: `hsl(${button.color})`,
          }}
        >
          {getButtonIcon(button.id, isRecording)}
          <span className="text-xs font-medium">
            {button.id === 'voice' && isRecording ? 'Stop' : button.shortName}
          </span>
        </button>
      ))}
    </div>
  );
};
