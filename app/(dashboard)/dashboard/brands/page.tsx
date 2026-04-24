import { Palette } from "lucide-react";

export default function BrandsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <Palette className="mb-4 h-16 w-16 text-muted-foreground" />
      <h1 className="text-2xl font-bold text-foreground">Brands</h1>
      <p className="mt-2 text-muted-foreground">Em breve</p>
    </div>
  );
}
