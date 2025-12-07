CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
name VARCHAR(255) NOT NULL,
email VARCHAR(255) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL,
role ENUM('participant,organizer','admin') DEFAULT 'participant',
createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
INDEX idx_email ('email'),
INDEX idx_role ('role'),

);

--table events
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR (36) PRIMARY KEY ,
    title VARCHAR ( 255 ) NOT NULL, 
    description TEXT,
    location VARCHAR (500),
    event_date TIMESTAMP,
    price DECIMAL(10, 2) DEFAULT 0,
    organizer_id VARCHAR(36) NOT NULL,
    photos JSON,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users{id} ON DELETE CASCADE, 
    INDEX idx_organizer (organizer_id),
    INDEX idx_event_date (event_date)

);


-- table inscription 
CREATE TABLE IF NOT EXISTS payements (
id VARCHAR ( 36)  PRIMARY KEY ,
user_id VARCHAR ( 36 )NOT NULL,
event_id VARCHAR ( 36 )NOT NULL ,
amount DECIMAL(10, 2) NOT NULL,
status ENUM ('pending', 'completed',  'failed' ,'refunded', )DEFAULT 'pending',
stripe_payment_intent_id VARCHAR(255),
payement_method ENUM ('card', 'bank_transfer', 'paypal', 'cash'),
refunded_at TIMESTAMP NULL ,
createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
 INDEX idx_user-payement (user_id)
 INDEX idx_event_payment (event_id)
 INDEX idx-status_payment (status),
 INDEX idx_stripe_id (stripe_payment-intent_id)
);
