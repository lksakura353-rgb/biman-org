<?php
// ============================================================
//  download.php  — Secure digital product download handler
// ============================================================
header('Content-Type: application/json');

$db_host = 'localhost';
$db_name = 'portfolio_db';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Database error']));
}

$orderNumber = $_GET['order'] ?? '';
$itemId = $_GET['item'] ?? '';

if (empty($orderNumber) || empty($itemId)) {
    http_response_code(400);
    die(json_encode(['success' => false, 'message' => 'Missing parameters']));
}

// Verify order exists and is paid
$stmt = $pdo->prepare("SELECT o.*, oi.file_path as item_file_path, oi.product_name, p.name as prod_name, p.product_type
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.order_number = ? AND oi.id = ? AND o.payment_status = 'Paid'");
$stmt->execute([$orderNumber, $itemId]);
$orderItem = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$orderItem) {
    http_response_code(403);
    die(json_encode(['success' => false, 'message' => 'Download not authorized or order not paid']));
}

if ($orderItem['product_type'] !== 'digital') {
    http_response_code(400);
    die(json_encode(['success' => false, 'message' => 'This item is not a digital product']));
}

// Get the file path
$filePath = $orderItem['item_file_path'] ?? $orderItem['file_path'] ?? '';

if (empty($filePath)) {
    http_response_code(404);
    die(json_encode(['success' => false, 'message' => 'File not found. Contact support.']));
}

// Build full file path
$baseDir = dirname(__DIR__);
$fullPath = $baseDir . '/' . $filePath;

// Check if file exists
if (!file_exists($fullPath)) {
    // For demo purposes, create a placeholder file
    $demoContent = "Demo Digital Product: " . $orderItem['prod_name'] . "\n\n";
    $demoContent .= "This is a placeholder file for demonstration.\n";
    $demoContent .= "In production, this would be the actual digital product file.\n";
    $demoContent .= "Order: " . $orderNumber . "\n";
    $demoContent .= "Item: " . $itemId;

    // Create directory if needed
    $dir = dirname($fullPath);
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    // For this demo, return JSON with download info instead of actual file
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Demo mode - file would be downloaded',
        'product_name' => $orderItem['prod_name'],
        'order_number' => $orderNumber,
        'file_path' => $filePath,
        'demo' => true,
        'note' => 'In production, this endpoint would serve the actual file. Create actual digital product files in the digital/ folder for real downloads.'
    ]);
    exit;
}

// Serve the file
$fileName = basename($filePath);
$fileSize = filesize($fullPath);

header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $fileName . '"');
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Pragma: public');
header('Content-Length: ' . $fileSize);

readfile($fullPath);
exit;
?>