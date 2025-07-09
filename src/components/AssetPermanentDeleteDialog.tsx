
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AssetPermanentDeleteDialogProps {
  onPermanentDelete: (reason: string) => void;
  canDelete: boolean;
  assetName: string;
}

export const AssetPermanentDeleteDialog = ({ 
  onPermanentDelete, 
  canDelete, 
  assetName 
}: AssetPermanentDeleteDialogProps) => {
  const [deleteReason, setDeleteReason] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    if (deleteReason.trim()) {
      onPermanentDelete(deleteReason);
      setDeleteReason("");
      setIsOpen(false);
    }
  };

  if (!canDelete) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="text-white"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Permanent verwijderen
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">Asset permanent verwijderen</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              <strong>WAARSCHUWING:</strong> Je staat op het punt om "{assetName}" permanent te verwijderen.
            </p>
            <p className="text-red-600 font-medium">
              Deze actie kan NIET ongedaan worden gemaakt. Het asset wordt volledig verwijderd uit de database.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <label htmlFor="permanent-delete-reason" className="text-sm font-medium">
            Reden voor permanente verwijdering *
          </label>
          <Textarea
            id="permanent-delete-reason"
            placeholder="Geef een reden op waarom dit asset permanent verwijderd moet worden..."
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeleteReason("")}>
            Annuleren
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!deleteReason.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            Permanent verwijderen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
