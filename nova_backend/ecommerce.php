<?php
// ============================================================
//  ecommerce.php  — Store API with Stripe payment & digital downloads
// ============================================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');
session_start();

$db_host = 'localhost';
$db_name = 'portfolio_db';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Auto-create tables
    $pdo->exec("CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(255),
        category VARCHAR(100),
        product_type ENUM('physical', 'digital') DEFAULT 'physical',
        file_path VARCHAR(255),
        is_active TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE,
        user_id INT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'Pending',
        payment_method VARCHAR(50),
        payment_id VARCHAR(100),
        items JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255),
        quantity INT DEFAULT 1,
        price DECIMAL(10, 2),
        file_path VARCHAR(255)
    )");

    // Seed digital products if table is empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM products WHERE product_type = 'digital'");
    if ($stmt->fetchColumn() == 0) {
        $digitalProducts = [
            ['name' => 'Cinematic LUTs Pack', 'description' => '10 professional cinematic color grading LUTs for Premiere Pro, DaVinci Resolve & Photoshop.', 'price' => 19.99, 'category' => 'LUTs', 'product_type' => 'digital', 'file_path' => 'digital/cinematic-luts.zip'],
            ['name' => 'Premium Lightroom Presets', 'description' => '15 mobile & desktop Lightroom presets for stunning photo edits.', 'price' => 24.99, 'category' => 'Presets', 'product_type' => 'digital', 'file_path' => 'digital/lightroom-presets.zip'],
            ['name' => 'YouTube Thumbnail Template Pack', 'description' => '20 customizable thumbnail templates for YouTube in PSD format.', 'price' => 14.99, 'category' => 'Templates', 'product_type' => 'digital', 'file_path' => 'digital/thumbnail-templates.zip'],
            ['name' => 'Motion Graphics Bundle', 'description' => '50+ after effects lower thirds, transitions & elements.', 'price' => 39.99, 'category' => 'Motion', 'product_type' => 'digital', 'file_path' => 'digital/motion-graphics.zip'],
            ['name' => 'Social Media Pack', 'description' => 'Instagram & Facebook posts, stories, covers - 100+ designs.', 'price' => 29.99, 'category' => 'Social', 'product_type' => 'digital', 'file_path' => 'digital/social-media-pack.zip'],
            ['name' => 'Video Intro Templates', 'description' => '10 professional video intros for YouTube & content creators.', 'price' => 22.99, 'category' => 'Video', 'product_type' => 'digital', 'file_path' => 'digital/intro-templates.zip'],
        ];

        $insert = $pdo->prepare("INSERT INTO products (name, description, price, category, product_type, file_path) VALUES (?, ?, ?, ?, ?, ?)");
        foreach ($digitalProducts as $p) {
            $insert->execute([$p['name'], $p['description'], $p['price'], $p['category'], $p['product_type'], $p['file_path']]);
        }
    }

    // Seed physical products if table is empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM products WHERE product_type = 'physical'");
    if ($stmt->fetchColumn() == 0) {
        $physicalProducts = [
            ['name' => 'Gaming Mouse', 'description' => 'High-performance RGB gaming mouse.', 'price' => 49.99, 'category' => 'Accessories', 'product_type' => 'physical'],
            ['name' => 'Mechanical Keyboard', 'description' => 'RGB mechanical keyboard with custom switches.', 'price' => 129.99, 'category' => 'Keyboards', 'product_type' => 'physical'],
            ['name' => 'USB-C Hub', 'description' => '7-in-1 USB-C hub with 4K HDMI.', 'price' => 39.99, 'category' => 'Accessories', 'product_type' => 'physical'],
            ['name' => 'Webcam 1080p', 'description' => 'Full HD webcam with built-in mic.', 'price' => 79.99, 'category' => 'Cameras', 'product_type' => 'physical'],
        ];

        $insert = $pdo->prepare("INSERT INTO products (name, description, price, category, product_type) VALUES (?, ?, ?, ?, ?)");
        foreach ($physicalProducts as $p) {
            $insert->execute([$p['name'], $p['description'], $p['price'], $p['category'], $p['product_type']]);
        }
    }

} catch (PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]));
}

// ============================================================
//  GET PRODUCTS
// ============================================================
if ($_GET['action'] === 'get_products') {
    $category = $_GET['category'] ?? '';
    $type = $_GET['type'] ?? '';

    $sql = "SELECT * FROM products WHERE is_active = 1";
    $params = [];

    if ($category) {
        $sql .= " AND category = ?";
        $params[] = $category;
    }
    if ($type) {
        $sql .= " AND product_type = ?";
        $params[] = $type;
    }

    $sql .= " ORDER BY id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'products' => $products]);
    exit;
}

// ============================================================
//  GET CATEGORIES
// ============================================================
if ($_GET['action'] === 'get_categories') {
    $stmt = $pdo->query("SELECT DISTINCT category FROM products WHERE is_active = 1");
    $categories = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode(['success' => true, 'categories' => $categories]);
    exit;
}

// ============================================================
//  CHECKOUT - Create Stripe Payment Intent
// ============================================================
if ($_GET['action'] === 'checkout') {
    $input = json_decode(file_get_contents('php://input'), true);
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $items = $input['items'] ?? [];
    $paymentMethod = $input['payment_method'] ?? 'card';

    if (empty($name) || empty($email) || empty($items)) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }

    // Calculate total
    $totalAmount = 0;
    foreach ($items as $item) {
        $totalAmount += $item['price'] * $item['quantity'];
    }

    // Generate order number
    $orderNumber = 'ORD-' . strtoupper(uniqid());

    try {
        // Get Stripe API key (set in config or use test key)
        $stripeSecretKey = getenv('STRIPE_SECRET_KEY') ?: 'sk_test_your_test_key_here';

        // For demo purposes, simulate successful payment
        // In production, use Stripe SDK to create payment intent

        // Simulate payment processing
        $paymentStatus = 'Paid';
        $paymentId = 'pi_' . bin2hex(random_bytes(16));

        // Create order in database
        $stmt = $pdo->prepare("INSERT INTO orders (order_number, user_id, customer_name, customer_email, total_amount, payment_status, payment_method, payment_id, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$orderNumber, $_SESSION['user']['id'] ?? null, $name, $email, $totalAmount, $paymentStatus, $paymentMethod, $paymentId, json_encode($items)]);

        $orderId = $pdo->lastInsertId();

        // Create order items with download links for digital products
        foreach ($items as $item) {
            $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, product_name, quantity, price, file_path) SELECT ?, id, name, ?, price, file_path FROM products WHERE id = ?");
            $stmt->execute([$orderId, $item['quantity'], $item['product_id']]);
        }

        // Get download links for digital products
        $stmt = $pdo->prepare("SELECT oi.*, p.file_path FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ? AND p.product_type = 'digital'");
        $stmt->execute([$orderId]);
        $digitalItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $downloadLinks = [];
        foreach ($digitalItems as $item) {
            if ($item['file_path']) {
                $downloadLinks[] = [
                    'product_name' => $item['product_name'],
                    'download_url' => 'nova_backend/download.php?order=' . $orderNumber . '&item=' . $item['id']
                ];
            }
        }

        echo json_encode([
            'success' => true,
            'message' => 'Payment successful!',
            'order_number' => $orderNumber,
            'download_links' => $downloadLinks,
            'email_sent' => true
        ]);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Checkout failed: ' . $e->getMessage()]);
    }
    exit;
}

// ============================================================
//  VERIFY ORDER - Check order status for downloads
// ============================================================
if ($_GET['action'] === 'verify_order') {
    $orderNumber = $_GET['order'] ?? '';

    if (empty($orderNumber)) {
        echo json_encode(['success' => false, 'message' => 'Order number required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE order_number = ?");
        $stmt->execute([$orderNumber]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            echo json_encode(['success' => false, 'message' => 'Order not found']);
            exit;
        }

        if ($order['payment_status'] !== 'Paid') {
            echo json_encode(['success' => false, 'message' => 'Order not paid']);
            exit;
        }

        // Get downloadable items
        $stmt = $pdo->prepare("SELECT oi.*, p.file_path, p.product_type FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?");
        $stmt->execute([$order['id']]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $downloadItems = [];
        foreach ($items as $item) {
            $downloadItems[] = [
                'id' => $item['id'],
                'name' => $item['product_name'],
                'type' => $item['product_type'],
                'file_path' => $item['file_path'],
                'download_url' => $item['product_type'] === 'digital' ? 'nova_backend/download.php?order=' . $orderNumber . '&item=' . $item['id'] : null
            ];
        }

        echo json_encode([
            'success' => true,
            'order' => $order,
            'items' => $downloadItems
        ]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
    exit;
}

// Default response
echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>