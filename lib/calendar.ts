import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
} from "date-fns";
import type { Post } from "@/types/database";

/** Retorna 35 ou 42 dias para preencher o grid mensal (incluindo dias de meses adjacentes) */
export function getCalendarDays(year: number, month: number): Date[] {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // domingo
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

/** Agrupa posts pelo dia de scheduled_at */
export function groupPostsByDay(posts: Post[]): Map<string, Post[]> {
  const map = new Map<string, Post[]>();
  for (const post of posts) {
    if (!post.scheduled_at) continue;
    const day = post.scheduled_at.slice(0, 10); // "YYYY-MM-DD"
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(post);
  }
  return map;
}

/** Retorna os posts de um determinado dia */
export function getPostsForDay(postsByDay: Map<string, Post[]>, date: Date): Post[] {
  const key = date.toISOString().slice(0, 10);
  return postsByDay.get(key) ?? [];
}

export { isSameDay, isSameMonth };
