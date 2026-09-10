-- Filter je odbijao bezazlene rečenice.
--
-- `normalizuj_tekst` briše sve razmake pre poređenja, pa se zabranjena reč
-- sklopi preko granice dve obične reči:
--
--   „kako je bilo kod vas"  →  „kakojebilokodvas"  →  sadrži „jebi"
--
-- Zbog toga je svaka žena koja napiše „kako je bilo kod vas" dobijala poruku
-- da tekst sadrži nedozvoljene reči. Isto važi za „koje bi", „gde je bilo",
-- „rečenice koje bi" i još niz sasvim običnih spojeva.
--
-- Brisanje razmaka je tu s razlogom — brani od zaobilaženja tipa „k u r a c".
-- Zato se ne uklanja nego razdvaja na dve provere:
--
--   1. reč se traži kao POČETAK reči u tekstu sa razmacima — hvata i nastavke
--      („jebiga", „kretenizam"), a ne sklapa se preko granice reči
--   2. zbijena provera ostaje, ali se pali samo kad tekst liči na zaobilaženje
--      — tri ili više usamljenih slova („k u r a c", „k.u.r.a.c")

-- Ista normalizacija kao dosad, samo razmaci ostaju.
create or replace function public.normalizuj_reci(t text)
returns text
language sql
immutable
as $$
  select btrim(regexp_replace(
           translate(
             lower(coalesce(t, '')),
             'čćšžđáàâéèêíìóòôúùû0134578@$',
             'ccszdaaaeeeiiooouuuoieasbta'
           ),
           '[^a-z]+', ' ', 'g'
         ));
$$;

create or replace function public.sadrzi_nedozvoljeno(t text, strogo boolean default false)
returns boolean
language plpgsql
immutable
as $$
declare
  sa_razmacima text := ' ' || public.normalizuj_reci(t) || ' ';
  zbijeno      text := public.normalizuj_tekst(t);
  zaobilazi    boolean;
  rec          text;
begin
  if zbijeno = '' then
    return false;
  end if;

  -- Tri ili više usamljenih slova znače da neko razbija reč da bi prošao.
  select count(*) >= 3 into zaobilazi
  from unnest(string_to_array(btrim(sa_razmacima), ' ')) w
  where length(w) = 1;

  foreach rec in array public.nedozvoljene_reci() loop
    if position(' ' || rec in sa_razmacima) > 0 then
      return true;
    end if;
    if zaobilazi and position(rec in zbijeno) > 0 then
      return true;
    end if;
  end loop;

  if strogo then
    foreach rec in array public.nedozvoljeno_u_imenu() loop
      if position(' ' || rec in sa_razmacima) > 0 then
        return true;
      end if;
      if zaobilazi and position(rec in zbijeno) > 0 then
        return true;
      end if;
    end loop;
  end if;

  return false;
end;
$$;

-- Provera — prva četiri moraju biti false, ostalo true:
-- select public.sadrzi_nedozvoljeno('kako je bilo kod vas')        as treba_false,
--        public.sadrzi_nedozvoljeno('koje bi bilo najbolje')       as treba_false2,
--        public.sadrzi_nedozvoljeno('gde je bilo mesta')           as treba_false3,
--        public.sadrzi_nedozvoljeno('sta se pokazalo drugacijim')  as treba_false4,
--        public.sadrzi_nedozvoljeno('jebi se')                     as treba_true,
--        public.sadrzi_nedozvoljeno('jebiga sve')                  as treba_true2,
--        public.sadrzi_nedozvoljeno('k u r a c')                   as treba_true3,
--        public.sadrzi_nedozvoljeno('ovo je kretenizam')           as treba_true4;
