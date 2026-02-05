import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from '@/types/roast';
import { getSettings, saveSettings, addCustomButton, deleteCustomButton, generateId } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getSettings());
  const [isAddingButton, setIsAddingButton] = useState(false);
  const [newButton, setNewButton] = useState({
    name: '',
    shortName: '',
     type: 'marker' as 'marker' | 'temperature' | 'speed',
    color: '180 50% 45%',
     speedUnit: '' as 'rpm' | '%' | '',
  });

  const handleToggleButton = (id: string, enabled: boolean) => {
    const updated = {
      ...settings,
      buttons: settings.buttons.map(b => 
        b.id === id ? { ...b, enabled } : b
      ),
    };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleAddButton = () => {
    if (!newButton.name.trim() || !newButton.shortName.trim()) {
      toast.error('Name and short name are required');
      return;
    }
    
    const created = addCustomButton({
      name: newButton.name.trim(),
      shortName: newButton.shortName.trim().slice(0, 5),
      type: newButton.type,
      color: newButton.color,
      enabled: true,
       speedUnit: newButton.type === 'speed' ? newButton.speedUnit : undefined,
    });
    
    setSettings(getSettings());
     setNewButton({ name: '', shortName: '', type: 'marker', color: '180 50% 45%', speedUnit: '' });
    setIsAddingButton(false);
    toast.success(`${created.name} button added`);
  };

  const handleDeleteButton = (id: string) => {
    deleteCustomButton(id);
    setSettings(getSettings());
    toast.success('Button removed');
  };

  const builtInButtons = settings.buttons.filter(b => b.isBuiltIn);
  const customButtons = settings.buttons.filter(b => !b.isBuiltIn);

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      {/* AdMob Banner Space - Reserved for native ads */}
      <div className="h-14 bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
        AdMob Banner Space
      </div>

      <header className="sticky top-14 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-8">
        {/* Built-in Buttons */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Quick Action Buttons</h2>
            <p className="text-sm text-muted-foreground">Toggle which buttons appear during roasting</p>
          </div>

          <div className="space-y-2">
            {builtInButtons.map((button) => (
              <div
                key={button.id}
                className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: `hsl(${button.color})` }}
                  />
                  <div>
                    <p className="font-medium">{button.name}</p>
                    <p className="text-xs text-muted-foreground">
                       {button.type === 'temperature' ? 'Opens temperature input' : button.type === 'speed' ? `Opens speed input${button.speedUnit ? ` (${button.speedUnit === 'rpm' ? 'RPM' : '%'})` : ''}` : 'Creates marker on graph'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={button.enabled}
                  onCheckedChange={(checked) => handleToggleButton(button.id, checked)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Custom Buttons */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Custom Buttons</h2>
              <p className="text-sm text-muted-foreground">Create your own markers and actions</p>
            </div>
            {!isAddingButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingButton(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            )}
          </div>

          {isAddingButton && (
            <div className="p-4 bg-secondary/50 rounded-lg border border-border space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="btn-name">Button Name</Label>
                  <Input
                    id="btn-name"
                    value={newButton.name}
                    onChange={(e) => setNewButton({ ...newButton, name: e.target.value })}
                    placeholder="e.g., Yellow Point"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="btn-short">Short Label (max 5)</Label>
                  <Input
                    id="btn-short"
                    value={newButton.shortName}
                    onChange={(e) => setNewButton({ ...newButton, shortName: e.target.value.slice(0, 5) })}
                    placeholder="e.g., YP"
                    className="bg-background"
                    maxLength={5}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Button Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newButton.type === 'marker' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewButton({ ...newButton, type: 'marker' })}
                  >
                    Marker
                  </Button>
                  <Button
                    type="button"
                    variant={newButton.type === 'temperature' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewButton({ ...newButton, type: 'temperature' })}
                  >
                    Temperature
                  </Button>
                   <Button
                     type="button"
                     variant={newButton.type === 'speed' ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => setNewButton({ ...newButton, type: 'speed' })}
                   >
                     Speed
                   </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {newButton.type === 'marker' 
                    ? 'Creates a marker on the graph when tapped' 
                     : newButton.type === 'temperature'
                       ? 'Opens temperature input dialog when tapped'
                       : 'Opens speed input dialog when tapped'}
                </p>
              </div>
 
               {newButton.type === 'speed' && (
                 <div className="space-y-2">
                   <Label>Speed Unit</Label>
                   <Select
                     value={newButton.speedUnit}
                     onValueChange={(value: string) => setNewButton({ ...newButton, speedUnit: value === 'none' ? '' : value as 'rpm' | '%' | '' })}
                   >
                     <SelectTrigger className="bg-background">
                       <SelectValue placeholder="Select unit (optional)" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="none">None</SelectItem>
                       <SelectItem value="rpm">RPM</SelectItem>
                       <SelectItem value="%">%</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               )}

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    '0 65% 50%',     // Red
                    '25 75% 50%',    // Orange
                    '45 85% 50%',    // Yellow
                    '120 50% 40%',   // Green
                    '180 50% 45%',   // Cyan
                    '220 60% 55%',   // Blue
                    '270 50% 55%',   // Purple
                    '320 60% 50%',   // Pink
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewButton({ ...newButton, color })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        newButton.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      style={{ backgroundColor: `hsl(${color})` }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddButton} className="flex-1">
                  Create Button
                </Button>
                <Button variant="outline" onClick={() => setIsAddingButton(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {customButtons.length === 0 && !isAddingButton ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No custom buttons yet. Create one to add custom markers to your roasts.
            </p>
          ) : (
            <div className="space-y-2">
              {customButtons.map((button) => (
                <div
                  key={button.id}
                  className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: `hsl(${button.color})` }}
                    />
                    <div>
                      <p className="font-medium">{button.name}</p>
                      <p className="text-xs text-muted-foreground">
                       {button.type === 'temperature' ? 'Temperature input' : button.type === 'speed' ? `Speed input${button.speedUnit ? ` (${button.speedUnit === 'rpm' ? 'RPM' : '%'})` : ''}` : 'Graph marker'} · "{button.shortName}"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={button.enabled}
                      onCheckedChange={(checked) => handleToggleButton(button.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteButton(button.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Settings;
