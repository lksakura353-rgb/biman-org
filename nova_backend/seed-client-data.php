<?php
// ============================================================
//  seed-client-data.php  — Seed demo portfolio data for testing
// ============================================================
header('Content-Type: application/json');
require_once 'config.php';

// Check for demo user, create if doesn't exist
$email = 'demo@stovest.com';
$password = 'demo123';

$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    // Create demo user
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->execute(['Demo Client', $email, $hash, 'user']);
    $userId = $pdo->lastInsertId();
    echo json_encode(['message' => 'Demo user created with ID: ' . $userId]);
} else {
    $userId = $user['id'];
    echo json_encode(['message' => 'Demo user exists with ID: ' . $userId]);
}

// Clear existing data
$pdo->prepare("DELETE FROM client_portfolio WHERE user_id = ?")->execute([$userId]);
$pdo->prepare("DELETE FROM client_transactions WHERE user_id = ?")->execute([$userId]);
$pdo->prepare("DELETE FROM client_accounts WHERE user_id = ?")->execute([$userId]);

// Seed portfolio holdings
$holdings = [
    ['AAPL', 'Apple Inc.', 104, 172.13, 185.50],
    ['MSFT', 'Microsoft Corp.', 45, 378.92, 420.30],
    ['GOOGL', 'Alphabet Inc.', 30, 141.80, 175.25],
    ['TSLA', 'Tesla Inc.', 25, 248.50, 175.80],
    ['NVDA', 'NVIDIA Corp.', 20, 450.20, 875.50],
];

foreach ($holdings as $h) {
    $stmt = $pdo->prepare("INSERT INTO client_portfolio (user_id, symbol, company_name, shares, avg_cost, current_price) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $h[0], $h[1], $h[2], $h[3], $h[4]]);
}

// Seed transactions
$transactions = [
    ['buy', 'AAPL', 50, 170.00, 8500],
    ['buy', 'MSFT', 20, 375.00, 7500],
    ['buy', 'NVDA', 10, 440.00, 4400],
    ['sell', 'AAPL', 10, 180.00, 1800],
    ['deposit', null, null, null, 15000],
    ['buy', 'GOOGL', 25, 140.00, 3500],
    ['buy', 'TSLA', 20, 250.00, 5000],
    ['buy', 'AAPL', 64, 175.00, 11200],
];

foreach ($transactions as $t) {
    $stmt = $pdo->prepare("INSERT INTO client_transactions (user_id, type, symbol, shares, price, amount) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $t[0], $t[1], $t[2], $t[3], $t[4]]);
}

// Seed accounts
$accounts = [
    ['Investment Account', 156780.50, 'USD'],
    ['Savings Account', 45200.00, 'USD'],
    ['Trading Wallet', 12850.25, 'USD'],
];

foreach ($accounts as $a) {
    $stmt = $pdo->prepare("INSERT INTO client_accounts (user_id, account_type, balance, currency) VALUES (?, ?, ?, ?)");
    $stmt->execute([$userId, $a[0], $a[1], $a[2]]);
}

echo json_encode(['success' => true, 'message' => 'Demo portfolio data seeded successfully']);
echo "\n\nDemo login credentials:";
echo "\nEmail: demo@stovest.com";
echo "\nPassword: demo123";
?>