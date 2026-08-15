-- Employee Leave Management System schema (MySQL)

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('employee', 'manager') NOT NULL DEFAULT 'employee',
  date_joined DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reason TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  document_path VARCHAR(255),
  document_original_name VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  remarks TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_leave_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_leave_requests_user_id (user_id)
);
