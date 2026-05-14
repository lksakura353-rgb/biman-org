<?php
// ============================================================
//  booking.php  — Service Booking System
// ============================================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$db_host = 'localhost';
$db_name = 'portfolio_db';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create booking tables
    $pdo->exec("CREATE TABLE IF NOT EXISTS booking_services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        duration INT DEFAULT 60, -- minutes
        price DECIMAL(10, 2),
        category VARCHAR(100),
        is_active TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_id INT NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        notes TEXT,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES booking_services(id)
    )");

    // Seed services if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM booking_services");
    if ($stmt->fetchColumn() == 0) {
        $services = [
            ['Video Editing (Basic)', 'Basic video editing including cutting, transitions, and simple color grading.', 60, 50, 'Video'],
            ['Video Editing (Premium)', 'Advanced editing with motion graphics, color grading, and sound design.', 120, 100, 'Video'],
            ['Thumbnail Design', 'Professional custom thumbnails with 2 revisions included.', 30, 25, 'Design'],
            ['Logo Animation', 'Animated logo reveal suitable for intros and outros.', 60, 75, 'Animation'],
            ['Motion Graphics', 'Custom motion graphics for social media and ads.', 90, 120, 'Animation'],
            ['Photo Retouching', 'Professional photo editing and retouching.', 45, 35, 'Photo'],
            ['LUT Creation', 'Custom cinematic color presets for video.', 60, 45, 'Color'],
            ['Consultation Call', '30-minute strategy call for your project.', 30, 30, 'Other']
        ];

        $insert = $pdo->prepare("INSERT INTO booking_services (name, description, duration, price, category) VALUES (?, ?, ?, ?, ?)");
        foreach ($services as $s) {
            $insert->execute([$s[0], $s[1], $s[2], $s[3], $s[4]]);
        }
    }

} catch (PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'DB Error: ' . $e->getMessage()]));
}

// ============================================================
//  API Actions
// ============================================================
$action = $_GET['action'] ?? '';

// GET ALL SERVICES
if ($action === 'get_services') {
    $category = $_GET['category'] ?? '';

    $sql = "SELECT * FROM booking_services WHERE is_active = 1";
    $params = [];

    if ($category) {
        $sql .= " AND category = ?";
        $params[] = $category;
    }

    $sql .= " ORDER BY category, price";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'services' => $services]);
    exit;
}

// GET SERVICE DETAILS
if ($action === 'get_service') {
    $id = $_GET['id'] ?? 0;

    $stmt = $pdo->prepare("SELECT * FROM booking_services WHERE id = ? AND is_active = 1");
    $stmt->execute([$id]);
    $service = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($service) {
        echo json_encode(['success' => true, 'service' => $service]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Service not found']);
    }
    exit;
}

// GET AVAILABLE TIME SLOTS
if ($action === 'get_slots') {
    $date = $_GET['date'] ?? date('Y-m-d');
    $serviceId = $_GET['service_id'] ?? 0;

    // Define working hours
    $startHour = 9;  // 9 AM
    $endHour = 18;   // 6 PM

    // Get booked slots for this date
    $stmt = $pdo->prepare("SELECT TIME(booking_time) as booked_time FROM bookings
        WHERE booking_date = ? AND status IN ('pending', 'confirmed')");
    $stmt->execute([$date]);
    $booked = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Get service duration
    $stmt = $pdo->prepare("SELECT duration FROM booking_services WHERE id = ?");
    $stmt->execute([$serviceId]);
    $duration = $stmt->fetchColumn() ?: 60;

    // Generate available slots
    $slots = [];
    for ($hour = $startHour; $hour < $endHour; $hour++) {
        for ($minute = 0; $minute < 60; $minute += 30) {
            $time = sprintf('%02d:%02d:00', $hour, $minute);
            if (!in_array($time, $booked)) {
                // Check if slot fits within working hours
                $slotEnd = $hour + floor(($minute + $duration) / 60);
                if ($slotEnd <= $endHour) {
                    $slots[] = [
                        'time' => $time,
                        'display' => sprintf('%02d:%02d', $hour, $minute)
                    ];
                }
            }
        }
    }

    echo json_encode(['success' => true, 'slots' => $slots, 'date' => $date]);
    exit;
}

// CREATE BOOKING
if ($action === 'book') {
    $input = json_decode(file_get_contents('php://input'), true);

    $serviceId = $input['service_id'] ?? 0;
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $date = $input['date'] ?? '';
    $time = $input['time'] ?? '';
    $notes = trim($input['notes'] ?? '');

    if (!$serviceId || !$name || !$email || !$date || !$time) {
        echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO bookings (service_id, customer_name, customer_email, customer_phone, booking_date, booking_time, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$serviceId, $name, $email, $phone, $date, $time, $notes]);

        $bookingId = $pdo->lastInsertId();

        // Get service details for confirmation
        $stmt = $pdo->prepare("SELECT name, price FROM booking_services WHERE id = ?");
        $stmt->execute([$serviceId]);
        $service = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'message' => 'Booking confirmed!',
            'booking_id' => $bookingId,
            'service' => $service['name'],
            'date' => $date,
            'time' => $time,
            'price' => $service['price']
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Booking failed: ' . $e->getMessage()]);
    }
    exit;
}

// GET BOOKING BY ID
if ($action === 'get_booking') {
    $id = $_GET['id'] ?? 0;

    $stmt = $pdo->prepare("SELECT b.*, bs.name as service_name, bs.price, bs.duration
        FROM bookings b
        JOIN booking_services bs ON b.service_id = bs.id
        WHERE b.id = ?");
    $stmt->execute([$id]);
    $booking = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($booking) {
        echo json_encode(['success' => true, 'booking' => $booking]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Booking not found']);
    }
    exit;
}

// GET ALL BOOKINGS (Admin)
if ($action === 'get_bookings') {
    $status = $_GET['status'] ?? '';

    $sql = "SELECT b.*, bs.name as service_name FROM bookings b
        JOIN booking_services bs ON b.service_id = bs.id";

    if ($status) {
        $sql .= " WHERE b.status = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$status]);
    } else {
        $stmt = $pdo->query($sql);
    }

    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'bookings' => $bookings]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>