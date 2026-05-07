<?php
// ============================================================
//  register.php  — creates a new user (role = 'user' by default)
// ============================================================
header('Content-Type: application/json');
require_once 'config.php';

$input    = json_decode(file_get_contents('php://input'), true);
$fullName = trim($input['fullName'] ?? '');
$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($fullName) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email is already registered.']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    // First registered user automatically becomes admin
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM users");
    $count = $stmt->fetch()['cnt'];
    $role  = ($count === 0) ? 'admin' : 'user';

    $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->execute([$fullName, $email, $hash, $role]);

    echo json_encode(['success' => true, 'message' => 'Account created successfully.', 'role' => $role]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
