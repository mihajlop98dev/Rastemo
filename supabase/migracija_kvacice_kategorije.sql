-- ---------------------------------------------------------------------------
-- Kategorije foruma sa kvačicama
--
-- Kategorije su na produkciji upisane bez kvačica („Treci trimestar",
-- „Nakon porodjaja"), što na ekranu deluje nemarno. Slug ostaje isti, menja
-- se samo prikazani naziv.
-- ---------------------------------------------------------------------------

update public.forum_categories set group_name = 'Trudnoća'  where group_name = 'Trudnoca';
update public.forum_categories set group_name = 'Porođaj'   where group_name = 'Porodjaj';
update public.forum_categories set name = 'Treći trimestar' where slug = 'treci-trimestar';
update public.forum_categories set name = 'Nakon porođaja'  where slug = 'nakon-porodjaja';
