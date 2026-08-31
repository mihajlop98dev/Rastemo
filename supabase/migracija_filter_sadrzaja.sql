-- ---------------------------------------------------------------------------
-- Provera nedozvoljenog sadržaja pri unosu
--
-- Provera stoji u bazi, ne u aplikaciji: ko ume da pozove PostgREST zaobišao bi
-- proveru u pregledaču u jednom potezu.
--
-- Dva nivoa strogosti:
--   * slobodan tekst (komentari, teme, odgovori) — hvata psovke i uvrede
--   * imena lekara i nazivi ustanova — uz to i pogrdne nadimke, koji u
--     slobodnom tekstu mogu biti sasvim legitimni („mesar" je zanimanje,
--     u imenu lekara nije)
-- ---------------------------------------------------------------------------

-- ---------- normalizacija ----------
-- Bez nje se filter zaobilazi trivijalno: „pičkа" -> „picka" -> „p i c k a"
-- -> „p.i.c.k.a" -> „p1cka". Zato se tekst prvo svodi na goli niz slova.
create or replace function public.normalizuj_tekst(t text)
returns text
language sql
immutable
as $$
  select regexp_replace(
           translate(
             lower(coalesce(t, '')),
             'čćšžđáàâéèêíìóòôúùû0134578@$',
             'ccszdaaaeeeiiooouuuoieasbta'
           ),
           '[^a-z]', '', 'g'   -- ostaju samo slova, pa razmaci i tačke ne pomažu
         );
$$;

-- ---------- spiskovi ----------
create or replace function public.nedozvoljene_reci()
returns text[]
language sql
immutable
as $$
  select array[
    -- psovke i vulgarnosti
    'kurac','kurca','kurcu','kurcem','picka','picke','picku','pizda','pizde',
    'jebem','jebes','jebo','jeba','jebi','jebite','jebena','jebeno','zajebi',
    'govno','govna','govnar','sranje','serem','usran',
    'kurva','kurve','kurvo','drolja','droljo','kucka','kuckо',
    'peder','pederu','pederi','pizdun',
    -- uvrede
    'kreten','kretenu','idiot','idiote','debil','debilu','retard','retardu',
    'budala','budalo','glupaca','glupan','tupan','magarac','stoko','stoka',
    'smrad','smradu','gnjida','ustaso','cetniku','balijo','ciganin','ciganko'
  ];
$$;

-- Reči koje su same po sebi obične, ali u imenu lekara ili nazivu ustanove
-- znače da neko zbija šalu ili vređa.
create or replace function public.nedozvoljeno_u_imenu()
returns text[]
language sql
immutable
as $$
  select array[
    'koljac','kasapin','mesar','dzelat','ubica','krvnik','sarlatan','nadrilekar',
    'test','proba','asdf','qwerty','xxx'
  ];
$$;

-- ---------- provera ----------
create or replace function public.sadrzi_nedozvoljeno(t text, strogo boolean default false)
returns boolean
language plpgsql
immutable
as $$
declare
  cist text := public.normalizuj_tekst(t);
  rec  text;
begin
  if cist = '' then
    return false;
  end if;

  foreach rec in array public.nedozvoljene_reci() loop
    if position(rec in cist) > 0 then
      return true;
    end if;
  end loop;

  if strogo then
    foreach rec in array public.nedozvoljeno_u_imenu() loop
      if position(rec in cist) > 0 then
        return true;
      end if;
    end loop;
  end if;

  return false;
end;
$$;

-- ---------- okidači ----------
create or replace function public.proveri_sadrzaj()
returns trigger
language plpgsql
as $$
begin
  case tg_table_name
    when 'doctors' then
      if public.sadrzi_nedozvoljeno(new.full_name, true)
         or public.sadrzi_nedozvoljeno(new.specialty, true) then
        raise exception 'Unos sadrži nedozvoljene reči. Ako misliš da je ovo greška, javi nam.'
          using errcode = 'check_violation';
      end if;

    when 'clinics' then
      if public.sadrzi_nedozvoljeno(new.name, true)
         or public.sadrzi_nedozvoljeno(new.address, false) then
        raise exception 'Unos sadrži nedozvoljene reči. Ako misliš da je ovo greška, javi nam.'
          using errcode = 'check_violation';
      end if;

    when 'forum_topics' then
      if public.sadrzi_nedozvoljeno(new.title) or public.sadrzi_nedozvoljeno(new.body) then
        raise exception 'Tekst sadrži reči koje ovde nisu dozvoljene.'
          using errcode = 'check_violation';
      end if;

    when 'forum_posts' then
      if public.sadrzi_nedozvoljeno(new.body) then
        raise exception 'Tekst sadrži reči koje ovde nisu dozvoljene.'
          using errcode = 'check_violation';
      end if;

    when 'doctor_reviews' then
      if public.sadrzi_nedozvoljeno(new.comment) then
        raise exception 'Tekst sadrži reči koje ovde nisu dozvoljene.'
          using errcode = 'check_violation';
      end if;

    when 'doctor_review_comments' then
      if public.sadrzi_nedozvoljeno(new.body) then
        raise exception 'Tekst sadrži reči koje ovde nisu dozvoljene.'
          using errcode = 'check_violation';
      end if;

    else null;
  end case;

  return new;
end;
$$;

drop trigger if exists proveri_sadrzaj_doctors on public.doctors;
create trigger proveri_sadrzaj_doctors before insert or update on public.doctors
  for each row execute function public.proveri_sadrzaj();

drop trigger if exists proveri_sadrzaj_clinics on public.clinics;
create trigger proveri_sadrzaj_clinics before insert or update on public.clinics
  for each row execute function public.proveri_sadrzaj();

drop trigger if exists proveri_sadrzaj_topics on public.forum_topics;
create trigger proveri_sadrzaj_topics before insert or update on public.forum_topics
  for each row execute function public.proveri_sadrzaj();

drop trigger if exists proveri_sadrzaj_posts on public.forum_posts;
create trigger proveri_sadrzaj_posts before insert or update on public.forum_posts
  for each row execute function public.proveri_sadrzaj();

drop trigger if exists proveri_sadrzaj_reviews on public.doctor_reviews;
create trigger proveri_sadrzaj_reviews before insert or update on public.doctor_reviews
  for each row execute function public.proveri_sadrzaj();

drop trigger if exists proveri_sadrzaj_review_comments on public.doctor_review_comments;
create trigger proveri_sadrzaj_review_comments before insert or update on public.doctor_review_comments
  for each row execute function public.proveri_sadrzaj();

notify pgrst, 'reload schema';
