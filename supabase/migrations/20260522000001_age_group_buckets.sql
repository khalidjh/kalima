-- Drop the old whitelist
alter table profiles drop constraint profiles_age_group_check;

-- Migrate existing values
update profiles set age_group = '3-4'  where age_group = '3-5';
update profiles set age_group = '5-7'  where age_group = '6-8';
update profiles set age_group = '8-10' where age_group = '9-12';

-- Reinstate the whitelist with new values
alter table profiles
  add constraint profiles_age_group_check
  check (age_group in ('3-4', '5-7', '8-10'));
