import { Button } from 'components/ui/button';

export function ActionButtons({ onClose, onSave, isSaving }) {
  return (
    <div className="flex justify-between items-center pt-4 border-t">
      <Button
        variant="outline"
        onClick={onClose}
        className="bg-gray-400 hover:bg-gray-500 text-white"
      >
        Fermer le paramétrage
      </Button>

      <Button
        onClick={onSave}
        disabled={isSaving}
        className="bg-green-500 hover:bg-green-600 text-white px-6"
      >
        {isSaving ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    </div>
  );
}
