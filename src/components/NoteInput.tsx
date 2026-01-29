import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface NoteInputProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
  timestamp: number;
  initialNote?: string;
}

export const NoteInput = ({ open, onClose, onSubmit, timestamp, initialNote = '' }: NoteInputProps) => {
  const [note, setNote] = useState(initialNote);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (note.trim()) {
      onSubmit(note.trim());
      setNote('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center">
            Add Note
            <span className="block text-sm font-normal text-muted-foreground mt-1">
              at {formatTime(timestamp)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter your note..."
            className="min-h-[100px] bg-input border-border focus:ring-primary"
            autoFocus
          />

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={!note.trim()}>
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
