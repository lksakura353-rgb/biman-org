-- --- DATABASE SCHEMA FOR NOVA ASSISTANT ---

CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- Table to store chat history
CREATE TABLE IF NOT EXISTS chat_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    sender ENUM('user', 'bot') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store custom bot responses (Optional)
CREATE TABLE IF NOT EXISTS bot_knowledge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    response TEXT NOT NULL
);

-- Seed some knowledge
('skills', 'Biman is an expert in After Effects, Premiere Pro, and Photoshop.');

-- Table to store guestbook signatures
CREATE TABLE IF NOT EXISTS guestbook (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at DATE NOT NULL
);

-- Table to store contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    service VARCHAR(100) NOT NULL,
    budget VARCHAR(50),
    timeline VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    attachment VARCHAR(500),
    newsletter BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('new', 'read', 'responded') DEFAULT 'new'
);

