-- Table utilisateur
CREATE TABLE utilisateur (
    id_user SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table salle
CREATE TABLE salle (
    id_room VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name_room VARCHAR(100) NOT NULL,
    ip_arduino VARCHAR(15),
    volume_room DECIMAL(10,2),
    glazed_surface DECIMAL(10,2),
    nb_doors INT,
    nb_exterior_walls INT,
    co2_threshold INT,
    min_temp DECIMAL(5,2),
    max_temp DECIMAL(5,2),
    min_hum DECIMAL(5,2),
    max_hum DECIMAL(5,2),
    is_exists BOOLEAN DEFAULT TRUE
);

-- Table donnee_mesure
CREATE TABLE donnee_mesure (
    id_data SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    value_co2 INT,
    value_temp DECIMAL(5,2),
    value_hum DECIMAL(5,2),
    clim_status BOOLEAN,
    id_room VARCHAR(36) REFERENCES salle(id_room) ON DELETE CASCADE
);
CREATE INDEX idx_timestamp ON donnee_mesure(timestamp);
CREATE INDEX idx_room_timestamp ON donnee_mesure(id_room, timestamp);

-- Table horaire_salle
CREATE TABLE horaire_salle (
    id_horaire SERIAL PRIMARY KEY,
    day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN
        ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
    start_time TIME,
    end_time TIME,
    id_room VARCHAR(36) REFERENCES salle(id_room) ON DELETE CASCADE,
    UNIQUE (day_of_week, id_room)
);

-- Insert default admin user (password: admin123)
-- Hash generated with bcrypt, cost 10
INSERT INTO utilisateur (username, password_hash, email, role)
VALUES ('admin', '$2b$10$Sd0bZqXZeaaXfEPkADL3IeUCJUk3SZ9xwvW33OwKzsWQb/4RflOy2', 'admin@thermocesi.fr', 'admin');

-- Insert sample room for testing
INSERT INTO salle (name_room, ip_arduino, volume_room, co2_threshold, min_temp, max_temp, min_hum, max_hum)
VALUES ('Salle A101', '192.168.1.100', 150.00, 1000, 18.00, 24.00, 30.00, 70.00);
