import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'components/ui/dialog';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Textarea } from 'components/ui/textarea';
import { Label } from 'components/ui/label';
import { createFormData } from 'utils/types';

export function AvailabilityModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isEditing = false 
}) {
  const [formData, setFormData] = useState(createFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(createFormData());
    }
  }, [initialData, isOpen]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
        setFormData(createFormData());
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData(createFormData());
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? 'Modifier la disponibilité' : 'Nouvelle disponibilité'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Date de début</Label>
            <Input
              id="start_date"
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
              className="border p-2 rounded"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end_date">Date de fin</Label>
            <Input
              id="end_date"
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              required
              className="border p-2 rounded"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="general_information">Informations complémentaires</Label>
            <Textarea
              id="general_information"
              name="general_information"
              placeholder="Informations complémentaires"
              value={formData.general_information}
              onChange={handleInputChange}
              className="border p-2 rounded min-h-[80px]"
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
