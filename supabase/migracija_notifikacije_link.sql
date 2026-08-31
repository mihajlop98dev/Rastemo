-- Notifikacija koja ne vodi nigde je samo obaveštenje da si nešto propustila.
-- Kolona `link` čuva putanju u aplikaciji na koju klik treba da odvede.
--
-- Kolona se dodaje na kraj i sme da bude prazna, pa stare notifikacije
-- nastavljaju da rade — samo nisu klikabilne.

alter table public.notifications
  add column if not exists link text;

-- Odgovor na temu sada nosi i putanju do same teme.
create or replace function public.obavesti_autora_teme(
  p_topic_id uuid,
  p_naslov   text,
  p_telo     text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  autor uuid;
begin
  if auth.uid() is null then
    raise exception 'Potrebna je prijava';
  end if;

  select author_id into autor from public.forum_topics where id = p_topic_id;
  if autor is null or autor = auth.uid() then
    return;   -- nema teme, ili je odgovorila sama autorka
  end if;

  insert into public.notifications (user_id, type, title, body, link)
  values (autor, 'forum', p_naslov, p_telo, '/zajednica/tema/' || p_topic_id::text);
end;
$$;

revoke all on function public.obavesti_autora_teme(uuid, text, text) from public;
grant execute on function public.obavesti_autora_teme(uuid, text, text) to authenticated;
