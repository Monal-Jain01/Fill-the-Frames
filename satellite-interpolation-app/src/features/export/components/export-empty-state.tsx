import { Card } from "@/components/ui/card";
import { FolderX } from "lucide-react";

export function ExportEmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
      <FolderX className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">No Exports Available</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-2">
        There are no export jobs in the queue or history. Start an export to see it here.
      </p>
    </Card>
  );
}
