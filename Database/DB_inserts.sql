-- Note: ST_MakePoint(longitude, latitude)

INSERT INTO reports (position, title, message)
VALUES (
    ST_SetSRID(ST_MakePoint(11.9668, 57.6997), 4326),
    'Broken streetlight',
    'Streetlight not working near Järntorget'
);

INSERT INTO reports (position, title, message)
VALUES (
    ST_SetSRID(ST_MakePoint(11.9746, 57.7089), 4326),
    'Pothole',
    'Large pothole on Avenyn causing issues'
);

INSERT INTO reports (position, title, message)
VALUES (
    ST_SetSRID(ST_MakePoint(11.9595, 57.6969), 4326),
    'Graffiti',
    'Graffiti on building wall in Majorna'
);

INSERT INTO reports (position, title, message)
VALUES (
    ST_SetSRID(ST_MakePoint(11.9702, 57.7032), 4326),
    'Overflowing trash bin',
    'Trash bin full near Kungsparken'
);

INSERT INTO reports (position, title, message)
VALUES (
    ST_SetSRID(ST_MakePoint(11.9830, 57.7075), 4326),
    'Damaged bench',
    'Bench broken near Ullevi stadium'
);