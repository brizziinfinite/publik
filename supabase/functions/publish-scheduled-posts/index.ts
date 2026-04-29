import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Esta Edge Function roda como cron a cada minuto via pg_cron no Supabase
// Busca posts com status=scheduled e scheduled_at <= now() e os publica
Deno.serve(async (req: Request) => {
  // Aceitar apenas chamadas internas (Authorization com service_role)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Variáveis de ambiente não configuradas" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const now = new Date().toISOString();

  // Buscar posts agendados que já passaram do horário
  const { data: postsToPublish, error: fetchError } = await supabase
    .from("posts")
    .select("id, brand_id, scheduled_at, platform")
    .eq("status", "scheduled")
    .lte("scheduled_at", now);

  if (fetchError) {
    console.error("Erro ao buscar posts:", fetchError.message);
    return new Response(
      JSON.stringify({ error: fetchError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!postsToPublish || postsToPublish.length === 0) {
    return new Response(
      JSON.stringify({ message: "Nenhum post para publicar", count: 0 }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const ids = postsToPublish.map((p) => p.id);

  // Atualizar status para published
  const { error: updateError } = await supabase
    .from("posts")
    .update({ status: "published", updated_at: now })
    .in("id", ids);

  if (updateError) {
    console.error("Erro ao publicar posts:", updateError.message);

    // Marcar como failed os que falharam
    await supabase
      .from("posts")
      .update({ status: "failed", updated_at: now })
      .in("id", ids);

    return new Response(
      JSON.stringify({ error: updateError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  console.log(`Publicados ${ids.length} posts:`, ids.join(", "));

  return new Response(
    JSON.stringify({
      message: `${ids.length} post(s) publicado(s) com sucesso`,
      count: ids.length,
      published_ids: ids,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
