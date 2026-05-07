<?php
// ============================================================
//  login.php  — password check → OTP (2FA) → session with role
// ============================================================
header('Content-Type: application/json');
session_start();
require_once 'config.php';

$input    = json_decode(file_get_contents('php://input'), true);
$email    = trim($input['email']    ?? '');
$password = $input['password'] ?? '';
$otp      = $input['otp']      ?? '';

// ── Step 2: verify OTP ───────────────────────────────────────
if (!empty($otp)) {
    if (
        isset($_SESSION['2fa_code'], $_SESSION['temp_user']) &&
        $_SESSION['2fa_code'] === $otp
    ) {
        $u = $_SESSION['temp_user'];
        unset($_SESSION['2fa_code'], $_SESSION['temp_user']);

        $_SESSION['user'] = $u;   // full user object in session
        echo json_encode(['success' => true, 'message' => 'Login successful', 'user' => $u]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid or expired OTP code.']);
    }
    exit;
}

// ── Step 1: verify email + password ──────────────────────────
if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, full_name, email, password, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $otp6 = sprintf('%06d', mt_rand(0, 999999));

        $_SESSION['2fa_code'] = $otp6;
        $_SESSION['temp_user'] = [
            'id'        => $user['id'],
            'full_name' => $user['full_name'],
            'email'     => $user['email'],
            'role'      => $user['role'],
        ];

        echo json_encode([
            'success'     => true,
            'require_2fa' => true,
            'message'     => 'A 6-digit OTP has been generated. Check your registered contact method.',
            // 'test_otp' => $otp6  -- REMOVED: never expose OTP in response (security risk)
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
