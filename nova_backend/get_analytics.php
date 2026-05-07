<?php
header('Content-Type: application/json');
session_start();
require_once 'config.php';
requireRole('admin');

// Today's stats
$today = date('Y-m-d');
$stmt = $pdo->prepare("SELECT COUNT(*) FROM activity_logs WHERE DATE(created_at) = ? AND action_type = 'page_view'");
$stmt->execute([$today]);
$pageViewsToday = $stmt->fetchColumn();

// Unique visitors today
$stmt = $pdo->prepare("SELECT COUNT(DISTINCT ip_address) FROM activity_logs WHERE DATE(created_at) = ?");
$stmt->execute([$today]);
$uniqueVisitorsToday = $stmt->fetchColumn();

// Page views last 7 days
$stmt = $pdo->prepare("SELECT DATE(created_at) as date, COUNT(*) as views FROM activity_logs WHERE action_type = 'page_view' AND created_at >= DATE(NOW()) - INTERVAL 7 DAY GROUP BY DATE(created_at) ORDER BY date ASC");
$stmt->execute();
$viewsData = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Top pages
$stmt = $pdo->prepare("SELECT page_url, COUNT(*) as views FROM activity_logs WHERE action_type = 'page_view' GROUP BY page_url ORDER BY views DESC LIMIT 5");
$stmt->execute();
$topPages = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Recent activity logs
$stmt = $pdo->prepare("
    SELECT a.action_type, a.page_url, a.created_at, u.full_name as user_name 
    FROM activity_logs a 
    LEFT JOIN users u ON a.user_id = u.id 
    ORDER BY a.created_at DESC 
    LIMIT 10
");
$stmt->execute();
$recentLogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'success'        => true,
    'todayViews'     => $pageViewsToday,
    'todayVisitors'  => $uniqueVisitorsToday,
    'chartData'      => $viewsData,
    'topPages'       => $topPages,
    'recentLogs'     => $recentLogs
]);
?>
