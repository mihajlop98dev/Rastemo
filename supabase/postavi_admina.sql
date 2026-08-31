-- Test nalog za proveru admin panela (obrisati kasnije)
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'admin.test@example.com');

-- Tvoj nalog — pokreni ovo kad se registruješ
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'mihajlop98@gmail.com');
