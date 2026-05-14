<?php
header('Content-Type: application/json');
session_start();
require_once 'config.php';

// Auto-create activity_logs table if not exists
$pdo->exec("CREATE TABLE IF NOT EXISTS activity_logs (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NULL,
    action_type VARCHAR(50) NOT NULL DEFAULT 'page_view',
    page_url    VARCHAR(255),
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$input  = json_decode(file_get_contents('php://input'), true);
$action = $input['action_type'] ?? 'page_view';
$page   = $input['page_url']   ?? $_SERVER['HTTP_REFERER'] ?? '';
$ip     = $_SERVER['REMOTE_ADDR'] ?? '';
$userId = $_SESSION['user']['id'] ?? null;

$stmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action_type, page_url, ip_address) VALUES (?, ?, ?, ?)");
$stmt->execute([$userId, $action, $page, $ip]);

echo json_encode(['success' => true]);
?>
