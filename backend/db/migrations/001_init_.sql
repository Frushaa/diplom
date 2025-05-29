CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('client', 'master'))
);

CREATE TABLE work_slots (
  id SERIAL PRIMARY KEY,
  master_id INTEGER REFERENCES users(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CHECK (start_time < end_time)
);

CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  master_id INTEGER REFERENCES users(id),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  duration INTERVAL NOT NULL
);