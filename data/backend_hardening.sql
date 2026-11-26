create unique index if not exists lessons_slug_key on public.lessons (slug);
create index if not exists lessons_level_position_idx on public.lessons (hsk_level, position);
create index if not exists lesson_slides_lesson_position_idx on public.lesson_slides (lesson_id, position);
create index if not exists lesson_words_lesson_position_idx on public.lesson_words (lesson_id, position);
create index if not exists answer_events_user_created_idx on public.answer_events (user_id, created_at desc);
create index if not exists answer_events_user_hanzi_idx on public.answer_events (user_id, hanzi);
create index if not exists recommendation_events_user_idx on public.recommendation_events (user_id);

do $$
begin
  alter table public.profiles add constraint profiles_hsk_level_range check (hsk_level between 0 and 6) not valid;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.profiles add constraint profiles_target_hsk_range check (target_hsk between 0 and 6) not valid;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.answer_events add constraint answer_events_response_ms_range check (response_ms is null or response_ms between 0 and 3600000) not valid;
exception when duplicate_object then null;
end $$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
