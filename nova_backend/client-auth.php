<?php
// ============================================================
//  client-auth.php  — Client login with 2FA (OTP) authentication
// ============================================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

// ============================================================
//  ACTION: LOGIN - Verify email + password, send OTP
// ============================================================
if ($action === 'login') {
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT id, full_name, email, password, role FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Generate 6-digit OTP
            $otp = sprintf('%06d', mt_rand(0, 999999));

            // Store OTP and temp user in session
            $_SESSION['client_2fa_code'] = $otp;
            $_SESSION['client_temp_user'] = [
                'id' => $user['id'],
                'full_name' => $user['full_name'],
                'email' => $user['email'],
                'role' => $user['role'],
            ];

            // In production, send OTP via email
            // mail($email, "Your StoVest OTP", "Your verification code: $otp");
            // For now, we log it (remove in production!)
            error_log("OTP for $email: $otp");

            echo json_encode([
                'success' => true,
                'require_2fa' => true,
                'message' => 'Verification code sent to your email.'
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

// ============================================================
//  ACTION: VERIFY OTP - Complete login after 2FA
// ============================================================
if ($action === 'verify_otp') {
    $email = trim($input['email'] ?? '');
    $otp = $input['otp'] ?? '';

    if (empty($otp)) {
        echo json_encode(['success' => false, 'message' => 'Please enter the verification code.']);
        exit;
    }

    if (
        isset($_SESSION['client_2fa_code'], $_SESSION['client_temp_user']) &&
        $_SESSION['client_2fa_code'] === $otp &&
        $_SESSION['client_temp_user']['email'] === $email
    ) {
        $u = $_SESSION['client_temp_user'];
        unset($_SESSION['client_2fa_code'], $_SESSION['client_temp_user']);

        // Create session token
        $token = bin2hex(random_bytes(32));
        $_SESSION['client_user'] = $u;
        $_SESSION['client_token'] = $token;

        // Log activity
        logActivity($pdo, $u['id'], 'login', 'client-portal');

        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => $u
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid or expired verification code.']);
    }
    exit;
}

// ============================================================
//  ACTION: RESEND OTP - Get new verification code
// ============================================================
if ($action === 'resend_otp') {
    $email = trim($input['email'] ?? '');

    if (!isset($_SESSION['client_temp_user']) || $_SESSION['client_temp_user']['email'] !== $email) {
        echo json_encode(['success' => false, 'message' => 'Session expired. Please login again.']);
        exit;
    }

    // Generate new OTP
    $otp = sprintf('%06d', mt_rand(0, 999999));
    $_SESSION['client_2fa_code'] = $otp;

    // In production, send via email
    error_log("New OTP for $email: $otp");

    echo json_encode(['success' => true, 'message' => 'New verification code sent.']);
    exit;
}

// ============================================================
//  ACTION: CHECK SESSION - Verify if user is logged in
// ============================================================
if ($action === 'check_session') {
    if (isset($_SESSION['client_user'])) {
        echo json_encode([
            'success' => true,
            'user' => $_SESSION['client_user']
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    }
    exit;
}

// ============================================================
//  ACTION: LOGOUT - End client session
// ============================================================
if ($action === 'logout') {
    $userId = $_SESSION['client_user']['id'] ?? null;
    if ($userId) {
        logActivity($pdo, $userId, 'logout', 'client-portal');
    }

    unset($_SESSION['client_user'], $_SESSION['client_token']);
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
    exit;
}

// ============================================================
//  ACTION: GET PORTFOLIO - Fetch client's portfolio data
// ============================================================
if ($action === 'get_portfolio') {
    if (!isset($_SESSION['client_user'])) {
        echo json_encode(['success' => false, 'message' => 'Not authenticated']);
        exit;
    }

    $userId = $_SESSION['client_user']['id'];

    try {
        // Get user's portfolio holdings
        $stmt = $pdo->prepare("SELECT * FROM client_portfolio WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $holdings = $stmt->fetchAll();

        // Get user's transactions
        $stmt = $pdo->prepare("SELECT * FROM client_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20");
        $stmt->execute([$userId]);
        $transactions = $stmt->fetchAll();

        // Get account summary
        $stmt = $pdo->prepare("SELECT * FROM client_accounts WHERE user_id = ?");
        $stmt->execute([$userId]);
        $accounts = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'holdings' => $holdings,
            'transactions' => $transactions,
            'accounts' => $accounts
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error loading portfolio: ' . $e->getMessage()]);
    }
    exit;
}

// ============================================================
//  Helper: Log user activity
// ============================================================
function logActivity($pdo, $userId, $action, $page) {
    try {
        $stmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action_type, page_url) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $action, $page]);
    } catch (Exception $e) {
        // Silent fail for logging
    }
}

// ============================================================
//  Auto-create client portfolio tables if they don't exist
// ============================================================
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS client_portfolio (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        symbol VARCHAR(20) NOT NULL,
        company_name VARCHAR(255),
        shares DECIMAL(15, 4) DEFAULT 0,
        avg_cost DECIMAL(10, 2) DEFAULT 0,
        current_price DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS client_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('buy', 'sell', 'deposit', 'withdrawal') NOT NULL,
        symbol VARCHAR(20),
        shares DECIMAL(15, 4),
        price DECIMAL(10, 2),
        amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS client_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        account_type VARCHAR(50) NOT NULL,
        balance DECIMAL(15, 2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )");
} catch (PDOException $e) {
    // Tables might already exist
}

// Default response for unknown action
echo json_encode(['success' => false, 'message' => 'Invalid action']);