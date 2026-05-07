<?php
header('Content-Type: application/json');
session_start();

$db_host = 'localhost';
$db_name = 'portfolio_db';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Auto-create e-commerce tables if they don't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(255),
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'Pending',
        items JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Insert mock products if table is empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM products");
    if ($stmt->fetchColumn() == 0) {
        $products = [
            ['name' => 'ROG Maximus IX', 'category' => 'Motherboards', 'price' => 499.00, 'description' => 'High-end gaming motherboard with hybrid cooling.', 'image_url' => 'https://i.postimg.cc/9fP6Ggbf/image.png'],
            ['name' => 'Strix Impact Mouse', 'category' => 'Mice', 'price' => 89.99, 'description' => 'Ultra-lightweight gaming mouse with RGB.', 'image_url' => 'https://i.postimg.cc/RCWPmbtT/download-(7).jpg'],
            ['name' => 'Claymore II Keyboard', 'category' => 'Keyboards', 'price' => 249.99, 'description' => 'Modular mechanical gaming keyboard.', 'image_url' => 'https://i.postimg.cc/RCWPmbtT/download-(7).jpg'],
            ['name' => 'Fusion II 500 Headset', 'category' => 'Audio', 'price' => 199.99, 'description' => 'High-fidelity gaming headset.', 'image_url' => 'https://i.postimg.cc/9fP6Ggbf/image.png'],
            ['name' => 'Swift PG32UQ Monitor', 'category' => 'Monitors', 'price' => 899.99, 'description' => '4K 144Hz HDR gaming monitor.', 'image_url' => 'https://i.postimg.cc/WpYQ6kGX/image.png'],
            ['name' => 'Thor 1200W Platinum', 'category' => 'Power', 'price' => 359.00, 'description' => 'Aura Sync OLED power supply.', 'image_url' => 'https://i.postimg.cc/9fP6Ggbf/image.png'],
            ['name' => 'Ryujin II 360 Cooler', 'category' => 'Cooling', 'price' => 299.99, 'description' => 'AIO liquid cooler with LCD screen.', 'image_url' => 'https://i.postimg.cc/RCWPmbtT/download-(7).jpg'],
            ['name' => 'Hyperion GR701 Case', 'category' => 'Cases', 'price' => 449.00, 'description' => 'Full-tower gaming chassis.', 'image_url' => 'https://i.postimg.cc/WpYQ6kGX/image.png']
        ];
        
        $insert = $pdo->prepare("INSERT INTO products (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)");
        foreach ($products as $p) {
            $insert->execute([$p['name'], $p['description'], $p['price'], $p['image_url'], $p['category']]);
        }
    }

} catch (PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]));
}

$action = $_GET['action'] ?? '';

if ($action === 'get_products') {
    $stmt = $pdo->query("SELECT * FROM products ORDER BY id DESC");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'products' => $products]);
} elseif ($action === 'checkout') {
    $input = json_decode(file_get_contents('php://input'), true);
    $name = $input['name'] ?? '';
    $email = $input['email'] ?? '';
    $items = $input['items'] ?? [];
    $totalAmount = $input['total'] ?? 0;
    $userId = $_SESSION['user_id'] ?? null;

    if (empty($name) || empty($email) || empty($items)) {
        echo json_encode(['success' => false, 'message' => 'Invalid checkout data']);
        exit;
    }

    try {
        // Here you would integrate Stripe/PayPal. For now, simulate success.
        $paymentStatus = 'Paid'; // Simulated
        
        $stmt = $pdo->prepare("INSERT INTO orders (user_id, customer_name, customer_email, total_amount, payment_status, items) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $name, $email, $totalAmount, $paymentStatus, json_encode($items)]);
        
        echo json_encode(['success' => true, 'message' => 'Payment successful! Order confirmed.']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Checkout failed: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
?>
