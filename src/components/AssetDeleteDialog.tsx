
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

interface AssetDeleteDialogProps {
  onDelete: (reason: string) => void;
  canDelete: boolean;
}

export const AssetDeleteDialog = ({ onDelete, canDelete }: AssetDeleteDialogProps) => {
  const [deleteReason, setDeleteReason] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    if (deleteReason.trim()) {
      onDelete(deleteReason);
      setDeleteReason("");
      setIsOpen(false);
    }
  };

  if (!canDelete) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Asset verwijderen</AlertDialogTitle>
          <AlertDialogDescription>
            Weet je zeker dat je dit asset wilt verwijderen? Het asset wordt gemarkeerd als "Deleted" en kan later worden hersteld.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <label htmlFor="delete-reason" className="text-sm font-medium">
            Reden voor verwijdering *
          </label>
          <Textarea
            id="delete-reason"
            placeholder="Geef een reden op voor het verwijderen van dit asset..."
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
            Verwijderen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
