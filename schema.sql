DROP TABLE People;

CREATE TABLE IF NOT EXISTS People(
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255)
);

INSERT INTO People (first_name, last_name) VALUES ('Lucas', 'Wilber');
INSERT INTO People (first_name, last_name) VALUES ('Bob', 'Marley');

SELECT * FROM People;