CREATE EXTENSION IF NOT EXISTS postgis;


create table reports (
  id bigserial not null,
  position geography not null,
  title text not null,
  message text not null,
  created_at timestamp with time zone not null default now(),
  unhandled_image_path text null,
  handled boolean not null default false,
  handled_at timestamp with time zone null,
  handled_image_path text null,
  handled_by bigint null,
  created_by bigint null,
  signed_up_by bigint null,
  signed_up_at timestamp with time zone null,
  constraint reports_pkey primary key (id),
  constraint fk_created_by foreign KEY (created_by) references users (id),
  constraint fk_handled_by foreign KEY (handled_by) references users (id),
  constraint fk_signed_up_by foreign KEY (signed_up_by) references users (id),
  constraint handled_consistency check (
    (
      (
        (handled = false)
        and (handled_at is null)
      )
      or (
        (handled = true)
        and (handled_at is not null)
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_reports_position on public.reports using gist ("position") TABLESPACE pg_default;

create table users (
  id bigserial not null,
  username text not null,
  password text not null,
  user_email text null,
  user_points bigint not null default '0'::bigint,
  constraint users_pkey primary key (id),
  constraint users_user_email_key unique (user_email),
  constraint users_username_key unique (username)
) TABLESPACE pg_default;

CREATE INDEX idx_reports_position
ON reports
USING GIST (position);