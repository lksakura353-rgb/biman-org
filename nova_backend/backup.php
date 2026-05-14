<?php
// ============================================================
//  backup.php  — Backup & Restore system (admin only)
// ============================================================
header('Content-Type: application/json');
session_start();
require_once 'config.php';
requireRole('admin');

$action  = $_GET['action'] ?? '';
$backDir = __DIR__ . '/backups';
if (!is_dir($backDir)) mkdir($backDir, 0755, true);

// ── LIST backups ─────────────────────────────────────────────
if ($action === 'list') {
    $stmt = $pdo->query("SELECT id, filename, size_kb, tables_included, created_at FROM system_backups ORDER BY created_at DESC");
    echo json_encode(['success' => true, 'backups' => $stmt->fetchAll()]);
    exit;
}

// ── CREATE backup ────────────────────────────────────────────
if ($action === 'create') {
    $tables = ['users','activity_logs','chat_logs','contact_submissions','products','orders','guestbook'];
    $export = ['meta' => ['created_at' => date('c'), 'version' => '1.0'], 'tables' => []];

    foreach ($tables as $table) {
        try {
            $rows = $pdo->query("SELECT * FROM `$table`")->fetchAll();
            $export['tables'][$table] = $rows;
        } catch (Exception $e) {
            // table may not exist yet — skip gracefully
        }
    }

    $json     = json_encode($export, JSON_PRETTY_PRINT);
    $filename = 'backup_' . date('Ymd_His') . '.json';
    $path     = $backDir . '/' . $filename;
    file_put_contents($path, $json);

    $sizeKb = (int) round(strlen($json) / 1024);
    $user   = currentUser();
    $stmt   = $pdo->prepare("INSERT INTO system_backups (filename, size_kb, tables_included, created_by) VALUES (?,?,?,?)");
    $stmt->execute([$filename, $sizeKb, implode(',', array_keys($export['tables'])), $user['id'] ?? null]);

    echo json_encode(['success' => true, 'message' => 'Backup created.', 'filename' => $filename, 'size_kb' => $sizeKb]);
    exit;
}

// ── DOWNLOAD backup ──────────────────────────────────────────
if ($action === 'download') {
    $filename = basename($_GET['file'] ?? '');
    $path     = $backDir . '/' . $filename;

    if (!$filename || !file_exists($path)) {
        echo json_encode(['success' => false, 'message' => 'File not found.']);
        exit;
    }

    header('Content-Type: application/json');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    readfile($path);
    exit;
}

// ── DELETE backup ────────────────────────────────────────────
if ($action === 'delete') {
    $input    = json_decode(file_get_contents('php://input'), true);
    $filename = basename($input['filename'] ?? '');
    $path     = $backDir . '/' . $filename;

    if ($filename && file_exists($path)) unlink($path);

    $stmt = $pdo->prepare("DELETE FROM system_backups WHERE filename = ?");
    $stmt->execute([$filename]);
    echo json_encode(['success' => true, 'message' => 'Backup deleted.']);
    exit;
}

// ── RESTORE backup ───────────────────────────────────────────
if ($action === 'restore') {
    $input    = json_decode(file_get_contents('php://input'), true);
    $filename = basename($input['filename'] ?? '');
    $path     = $backDir . '/' . $filename;

    if (!$filename || !file_exists($path)) {
        echo json_encode(['success' => false, 'message' => 'Backup file not found.']);
        exit;
    }

    $data = json_decode(file_get_contents($path), true);
    if (!$data || !isset($data['tables'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid backup format.']);
        exit;
    }

    $pdo->beginTransaction();
    try {
        foreach ($data['tables'] as $table => $rows) {
            // Validate table name (whitelist)
            $allowed = ['users','activity_logs','chat_logs','contact_submissions','products','orders','guestbook'];
            if (!in_array($table, $allowed, true)) continue;

            $pdo->exec("DELETE FROM `$table`");

            if (empty($rows)) continue;
            $cols        = array_keys($rows[0]);
            $colsList    = implode(',', array_map(fn($c) => "`$c`", $cols));
            $placeholders = implode(',', array_fill(0, count($cols), '?'));
            $stmt         = $pdo->prepare("INSERT INTO `$table` ($colsList) VALUES ($placeholders)");

            foreach ($rows as $row) {
                $stmt->execute(array_values($row));
            }
        }
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Database restored successfully.']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Restore failed: ' . $e->getMessage()]);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);
?>
