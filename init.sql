CREATE TABLE users (
  id_user SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
                     id_room VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
                     ip_arduino VARCHAR(50),
                     name_room VARCHAR(50) NOT NULL,
                     volume_room DECIMAL(15,2),
                     glazed_surface DECIMAL(15,2),
                     nb_doors INT,
                     nb_exterior_walls INT,
                     min_temp DECIMAL(15,2),
                     max_temp DECIMAL(15,2),
                     monday_start TIME,
                     monday_end TIME,
                     tuesday_start TIME,
                     tuesday_end TIME,
                     wednesday_start TIME,
                     wednesday_end TIME,
                     thursday_start TIME,
                     thursday_end TIME,
                     friday_start TIME,
                     friday_end TIME,
                     saturday_start TIME,
                     saturday_end TIME,
                     sunday_start TIME,
                     sunday_end TIME,
                     is_exists BOOLEAN DEFAULT TRUE
);

CREATE TABLE data (
                    id_data SERIAL PRIMARY KEY,
                    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    value_co2 INT,
                    value_temp DECIMAL(15,2),
                    value_hum DECIMAL(15,2),
                    clim_status BOOLEAN,
                    id_room VARCHAR(50) NOT NULL,
                    FOREIGN KEY (id_room) REFERENCES rooms(id_room) ON DELETE CASCADE
);

CREATE INDEX idx_timestamp ON data(timestamp);
CREATE INDEX idx_room_timestamp ON data(id_room, timestamp);

INSERT INTO users (username, password_hash, email, role)
VALUES ('admin', '$2b$10$Sd0bZqXZeaaXfEPkADL3IeUCJUk3SZ9xwvW33OwKzsWQb/4RflOy2', 'admin@thermocesi.fr', 'admin');
