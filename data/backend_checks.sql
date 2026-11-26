select tablename, rowsecurity from pg_tables where schemaname = 'public' order by tablename;

select l.hsk_level, count(*) as lessons,
  count(*) filter (where s.n > 0) as with_slides,
  count(*) filter (where w.n > 0) as with_words
from public.lessons l
left join lateral (select count(*) as n from public.lesson_slides where lesson_id = l.id) s on true
left join lateral (select count(*) as n from public.lesson_words where lesson_id = l.id) w on true
group by l.hsk_level
order by l.hsk_level;

select slug, count(*) from public.lessons group by slug having count(*) > 1;

select hsk_level, position, count(*) from public.lessons group by hsk_level, position having count(*) > 1;

select count(*) as orphan_slides from public.lesson_slides s left join public.lessons l on l.id = s.lesson_id where l.id is null;

select hsk_level, count(*) as words from public.words group by hsk_level order by hsk_level;

select pg_get_functiondef('public.delete_my_account'::regproc);
