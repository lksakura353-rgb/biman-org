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

if (strpos($lowerMsg, 'hi') !== false || strpos($lowerMsg, 'hello') !== false || strpos($lowerMsg, 'hey') !== false) {
    $reply = "Hello from the PHP Backend! I'm Nova, powered by a database now. How can I help you?";
} elseif (strpos($lowerMsg, 'who are you') !== false || strpos($lowerMsg, 'name') !== false) {
    $reply = "I am Nova, Biman's AI Assistant. I help visitors explore his portfolio and connect with him.";
} elseif (strpos($lowerMsg, 'project') !== false || strpos($lowerMsg, 'work') !== false) {
    $reply = "Biman has amazing projects in video editing, graphic design, and 3D. Check out his portfolio section!";
} elseif (strpos($lowerMsg, 'skill') !== false || strpos($lowerMsg, 'expertise') !== false) {
    $reply = "Biman excels in Adobe Premiere Pro, After Effects, Photoshop, Blender, and more. He's a pro in gaming content!";
} elseif (strpos($lowerMsg, 'contact') !== false || strpos($lowerMsg, 'hire') !== false) {
    $reply = "You can contact Biman via email at bimanranasinghe@email.com or WhatsApp. He's open to new projects!";
} elseif (strpos($lowerMsg, 'price') !== false || strpos($lowerMsg, 'cost') !== false) {
    $reply = "Services start from $15 for thumbnails, $50 for video editing. See the pricing section for details.";
} elseif (strpos($lowerMsg, 'blog') !== false || strpos($lowerMsg, 'article') !== false) {
    $reply = "Biman writes about editing tips, thumbnail design, and content creation. Great reads!";
} elseif (strpos($lowerMsg, 'review') !== false || strpos($lowerMsg, 'testimonial') !== false) {
    $reply = "Clients give Biman 4.9 stars! He has fast delivery and creative work.";
} elseif (strpos($lowerMsg, 'valorant') !== false) {
    $reply = "Biman loves Valorant! His montages are epic. The site theme is inspired by the game.";
} else {
    $replies = [
        "That's interesting! Tell me more about what you're looking for.",
        "I'm here to help with anything related to Biman's portfolio. What can I assist with?",
        "Biman specializes in creative content. How can I guide you?",
        "Feel free to ask about his skills, projects, or how to get in touch!"
    ];
    $reply = $replies[array_rand($replies)];
}

// Save bot reply
$stmt = $pdo->prepare("INSERT INTO chat_logs (message, sender) VALUES (?, 'bot')");
$stmt->execute([$reply]);

echo json_encode(['reply' => $reply]);
?>
