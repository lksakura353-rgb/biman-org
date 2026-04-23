<?php
header('Content-Type: application/json');

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

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);
$userMessage = $input['message'] ?? '';

if (empty($userMessage)) {
    echo json_encode(['reply' => "I didn't catch that. Can you repeat?"]);
    exit;
}

// --- LOG MESSAGE TO SQL ---
$stmt = $pdo->prepare("INSERT INTO chat_logs (message, sender) VALUES (?, 'user')");
$stmt->execute([$userMessage]);

// --- SIMPLE AI LOGIC (In a real app, you'd call an OpenAI API here) ---
$reply = "I am processing your request on the server...";
$lowerMsg = strtolower($userMessage);

if (strpos($lowerMsg, 'hi') !== false || strpos($lowerMsg, 'hello') !== false) {
    $reply = "Hello from the PHP Backend! I'm Nova, powered by a database now.";
} elseif (strpos($lowerMsg, 'project') !== false) {
    $reply = "Biman has many projects stored in my system. He excels in Video Editing and Graphic Design.";
}

// Save bot reply
$stmt = $pdo->prepare("INSERT INTO chat_logs (message, sender) VALUES (?, 'bot')");
$stmt->execute([$reply]);

echo json_encode(['reply' => $reply]);
?>
