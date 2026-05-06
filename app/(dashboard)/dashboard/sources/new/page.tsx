import { createClient } from "@/lib/supabase/server";

import NewSourceClient from "./NewSourceClient";

export default async function NewSourcePage() {
  const supabase = await createClient();
  const db = supabase as any;

  const { data: brands } = await db
    .from("brands")
    .select("id, name")
    .order("name");

  return <NewSourceClient brands={brands ?? []} />;
}
