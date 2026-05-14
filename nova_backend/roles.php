<?php
// ============================================================
//  roles.php  — RBAC management endpoint (admin only)
// ============================================================
header('Content-Type: application/json');
session_start();
require_once 'config.php';
requireRole('admin');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// GET  /roles.php?action=list_users
if ($method === 'GET' && $action === 'list_users') {
    $stmt = $pdo->query("SELECT id, full_name, email, role, created_at FROM users ORDER BY id ASC");
    echo json_encode(['success' => true, 'users' => $stmt->fetchAll()]);
    exit;
}

// POST /roles.php?action=set_role
if ($method === 'POST' && $action === 'set_role') {
    $input  = json_decode(file_get_contents('php://input'), true);
    $userId = (int)($input['user_id'] ?? 0);
    $role   = $input['role'] ?? '';

    $allowed = ['admin', 'moderator', 'user'];
    if (!in_array($role, $allowed, true)) {
        echo json_encode(['success' => false, 'message' => 'Invalid role.']);
        exit;
    }
    if ($userId === (currentUser()['id'] ?? 0)) {
        echo json_encode(['success' => false, 'message' => 'Cannot change your own role.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE users SET role = ? WHERE id = ?");
    $stmt->execute([$role, $userId]);
    echo json_encode(['success' => true, 'message' => "Role updated to '$role'."]);
    exit;
}

// POST /roles.php?action=delete_user
if ($method === 'POST' && $action === 'delete_user') {
    $input  = json_decode(file_get_contents('php://input'), true);
    $userId = (int)($input['user_id'] ?? 0);

    if ($userId === (currentUser()['id'] ?? 0)) {
        echo json_encode(['success' => false, 'message' => 'Cannot delete yourself.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    echo json_encode(['success' => true, 'message' => 'User deleted.']);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);
?>
