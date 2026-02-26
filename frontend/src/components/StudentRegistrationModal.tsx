import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StudentRegistrationModalProps {
  onComplete: (name: string, batch: string) => void;
}

export default function StudentRegistrationModal({ onComplete }: StudentRegistrationModalProps) {
  const [name, setName] = useState('');
  const [batch, setBatch] = useState('');

  const handleSubmit = () => {
    if (name.trim() && batch.trim()) {
      onComplete(name.trim(), batch.trim());
    }
  };

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Student Information</DialogTitle>
          <DialogDescription>
            Please enter your details before starting the test.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch">Batch Number *</Label>
            <Input
              id="batch"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              placeholder="Enter your batch number"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!name.trim() || !batch.trim()} className="w-full">
            Start Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
