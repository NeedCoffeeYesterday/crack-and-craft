 import { useState } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Scale, TrendingDown } from 'lucide-react';
 
 interface WeightOutDialogProps {
   open: boolean;
   onClose: () => void;
   onSubmit: (roastedWeight: number) => void;
   greenWeight?: number;
 }
 
 export const WeightOutDialog = ({ open, onClose, onSubmit, greenWeight }: WeightOutDialogProps) => {
   const [roastedWeight, setRoastedWeight] = useState<string>('');
 
   const parsedWeight = roastedWeight ? parseFloat(roastedWeight) : 0;
   
   const calculateLossPercent = () => {
     if (!greenWeight || greenWeight <= 0 || parsedWeight <= 0) return null;
     if (parsedWeight >= greenWeight) return 0;
     return ((greenWeight - parsedWeight) / greenWeight) * 100;
   };
 
   const lossPercent = calculateLossPercent();
 
   const handleSubmit = () => {
     if (parsedWeight > 0) {
       onSubmit(parsedWeight);
     }
     onClose();
   };
 
   const handleSkip = () => {
     onClose();
   };
 
   return (
     <Dialog open={open} onOpenChange={onClose}>
       <DialogContent className="max-w-sm mx-auto bg-card border-border">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <Scale className="w-5 h-5 text-primary" />
             Enter Roasted Weight
           </DialogTitle>
           <DialogDescription>
             {greenWeight ? (
               <>Green weight: <span className="font-medium">{greenWeight}g</span></>
             ) : (
               'Record the weight of your roasted coffee'
             )}
           </DialogDescription>
         </DialogHeader>
 
         <div className="space-y-4 py-4">
           <div className="space-y-2">
             <Label htmlFor="roasted-weight">Roasted Weight</Label>
             <div className="flex items-center gap-2">
               <Input
                 id="roasted-weight"
                 type="number"
                 placeholder="Enter weight"
                 value={roastedWeight}
                 onChange={(e) => setRoastedWeight(e.target.value)}
                 className="flex-1"
                 min="0"
                 step="0.1"
                 autoFocus
               />
               <span className="text-sm text-muted-foreground font-medium">g</span>
             </div>
           </div>
 
           {lossPercent !== null && greenWeight && (
             <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
               <div className="flex items-center gap-2 text-primary">
                 <TrendingDown className="w-4 h-4" />
                 <span className="text-sm font-medium">Weight Loss</span>
               </div>
               <p className="text-2xl font-bold text-primary mt-1">
                 {lossPercent.toFixed(1)}%
               </p>
               <p className="text-xs text-muted-foreground mt-1">
                 {(greenWeight - parsedWeight).toFixed(1)}g lost during roasting
               </p>
             </div>
           )}
 
           <div className="flex gap-3 pt-2">
             <Button variant="outline" onClick={handleSkip} className="flex-1">
               Skip
             </Button>
             <Button 
               onClick={handleSubmit} 
               className="flex-1"
               disabled={!parsedWeight || parsedWeight <= 0}
             >
               Save
             </Button>
           </div>
         </div>
       </DialogContent>
     </Dialog>
   );
 };