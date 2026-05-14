<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$db_host = 'localhost';
$db_name = 'portfolio_db';
$db_user = 'root';
$db_pass = '';

$db_available = false;
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db_available = true;
} catch (PDOException $e) {
    // Fallback to file storage if DB fails
    $db_available = false;
}

// Get form data
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$service = $_POST['service'] ?? '';
$budget = $_POST['budget'] ?? '';
$timeline = $_POST['timeline'] ?? '';
$subject = $_POST['subject'] ?? '';
$message = $_POST['message'] ?? '';
$newsletter = isset($_POST['newsletter']) ? 1 : 0;

// Validate required fields
if (empty($name) || empty($email) || empty($subject) || empty($message) || empty($service)) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

// Handle file upload
$attachment_path = '';
if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] == 0) {
    $allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/zip', 'video/mp4', 'video/quicktime'];
    $max_size = 10 * 1024 * 1024; // 10MB

    // Use finfo for real MIME detection (not browser-supplied type, which can be spoofed)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $real_mime = $finfo->file($_FILES['attachment']['tmp_name']);
    if (!in_array($real_mime, $allowed_types)) {
        echo json_encode(['success' => false, 'message' => 'File type not allowed.']);
        exit;
    }

    if ($_FILES['attachment']['size'] > $max_size) {
        echo json_encode(['success' => false, 'message' => 'File size too large (max 10MB).']);
        exit;
    }

    $upload_dir = 'uploads/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    $file_extension = pathinfo($_FILES['attachment']['name'], PATHINFO_EXTENSION);
    $file_name = uniqid() . '.' . $file_extension;
    $attachment_path = $upload_dir . $file_name;

    if (!move_uploaded_file($_FILES['attachment']['tmp_name'], $attachment_path)) {
        echo json_encode(['success' => false, 'message' => 'Failed to upload file.']);
        exit;
    }
}

// Save to database or file
if ($db_available) {
    try {
        $stmt = $pdo->prepare("INSERT INTO contact_submissions (name, email, phone, service, budget, timeline, subject, message, attachment, newsletter, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$name, $email, $phone, $service, $budget, $timeline, $subject, $message, $attachment_path, $newsletter]);
    } catch (PDOException $e) {
        // Fallback to file
        saveToFile();
    }
} else {
    saveToFile();
}

function saveToFile() {
    global $name, $email, $phone, $service, $budget, $timeline, $subject, $message, $attachment_path, $newsletter;

    $data = [
        'timestamp' => date('Y-m-d H:i:s'),
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'service' => $service,
        'budget' => $budget,
        'timeline' => $timeline,
        'subject' => $subject,
        'message' => $message,
        'attachment' => $attachment_path,
        'newsletter' => $newsletter
    ];

    $filename = 'contact_submissions_' . date('Y-m-d') . '.json';
    $existing = file_exists($filename) ? json_decode(file_get_contents($filename), true) : [];
    $existing[] = $data;
    file_put_contents($filename, json_encode($existing, JSON_PRETTY_PRINT));
}

// Send email notification (optional)
// TODO: Replace with your real email address
$to = 'your.real.email@gmail.com';
$email_subject = 'New Contact Form Submission: ' . $subject;
$email_body = "Name: $name\nEmail: $email\nPhone: $phone\nService: $service\nBudget: $budget\nTimeline: $timeline\n\nMessage:\n$message";

if ($attachment_path) {
    $email_body .= "\n\nAttachment: $attachment_path";
}

$headers = "From: $email\r\nReply-To: $email";

mail($to, $email_subject, $email_body, $headers);

echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);
?>