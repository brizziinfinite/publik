"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Brand } from "@/types/database";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface DeleteBrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
  onSuccess: () => void;
}

export function DeleteBrandDialog({
  open,
  onOpenChange,
  brand,
  onSuccess,
}: DeleteBrandDialogProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!brand) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("brands")
        .delete()
        .eq("id", brand.id);
      if (error) throw error;
      toast.success(`Brand "${brand.name}" excluída.`);
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Erro ao excluir brand.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Brand</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir <strong>{brand?.name}</strong>? Todos
            os posts desta brand também serão excluídos. Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
