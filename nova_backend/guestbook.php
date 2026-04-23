<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// --- DATABASE CONFIGURATION ---
$db_host = 'localhost';
$db_name = 'portfolio_db';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(['error' => 'Database connection failed']));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all messages
    $stmt = $pdo->query("SELECT name, message, created_at FROM guestbook ORDER BY id DESC");
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($messages);
} elseif ($method === 'POST') {
    // Save new message
    $input = json_decode(file_get_contents('php://input'), true);
    $name = $input['name'] ?? '';
    $message = $input['message'] ?? '';
    $date = date('Y-m-d');

    if (empty($name) || empty($message)) {
        echo json_encode(['error' => 'Name and message are required']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO guestbook (name, message, created_at) VALUES (?, ?, ?)");
    $stmt->execute([$name, $message, $date]);

    echo json_encode(['success' => true, 'message' => 'Signature added successfully']);
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
