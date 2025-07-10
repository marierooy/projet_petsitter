import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'components/ui/dialog';
import { Button } from 'components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ManagementModal({ 
  isOpen, 
  onClose, 
  event, 
  onEdit, 
  onDelete, 
  onConfigure 
}) {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold mb-4">
            Gérer la disponibilité
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
            <p className="text-sm text-gray-600">
              Du {format(event.start, 'dd MMMM yyyy', { locale: fr })} 
              au {format(event.end, 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={onEdit}
              className="bg-yellow-400 hover:bg-yellow-500 text-white border-yellow-400"
            >
              Modifier
            </Button>
            
            <Button
              variant="destructive"
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </Button>
            
            <Button
              onClick={onConfigure}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Paramétrer
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}