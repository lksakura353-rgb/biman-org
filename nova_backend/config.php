<?php
// ============================================================
//  config.php — shared DB connection helper
// ============================================================
$db_host = 'localhost';
$db_name = 'portfolio_db';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Auto-provision essential tables (idempotent)
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin','moderator','user') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Add role column if upgrading from older schema
    try { $pdo->exec("ALTER TABLE users ADD COLUMN role ENUM('admin','moderator','user') NOT NULL DEFAULT 'user'"); } catch(Exception $e) {}

    $pdo->exec("CREATE TABLE IF NOT EXISTS system_backups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        size_kb INT NOT NULL DEFAULT 0,
        tables_included TEXT NOT NULL,
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS chat_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message TEXT NOT NULL,
        sender ENUM('user','bot') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS guestbook (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at DATE NOT NULL
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS contact_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        service VARCHAR(100),
        budget VARCHAR(100),
        timeline VARCHAR(100),
        subject VARCHAR(255),
        message TEXT,
        attachment VARCHAR(255),
        newsletter TINYINT DEFAULT 0,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

} catch (PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'DB error: ' . $e->getMessage()]));
}

// ── Helper: get current logged-in user from session ──────────
function currentUser() {
    if (session_status() === PHP_SESSION_NONE) session_start();
    return $_SESSION['user'] ?? null;
}

// ── Helper: require a minimum role ────────────────────────────
// Roles hierarchy:  admin > moderator > user
function requireRole(string $minRole, $pdo = null): void {
    $hierarchy = ['user' => 1, 'moderator' => 2, 'admin' => 3];
    $user = currentUser();
    if (!$user) {
        http_response_code(401);
        die(json_encode(['success' => false, 'message' => 'Not authenticated.']));
    }
    $userLevel  = $hierarchy[$user['role']] ?? 0;
    $minLevel   = $hierarchy[$minRole] ?? 999;
    if ($userLevel < $minLevel) {
        http_response_code(403);
        die(json_encode(['success' => false, 'message' => "Access denied. Requires role: $minRole"]));
    }
}
?>
