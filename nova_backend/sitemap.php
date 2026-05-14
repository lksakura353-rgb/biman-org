<?php
// ============================================================
//  sitemap.php  — Generate XML sitemap
// ============================================================
header('Content-Type: application/xml');

$baseUrl = 'https://bimanranasinghe.com'; // Change to your domain
$lastmod = date('Y-m-d');

// Static pages
$pages = [
    ['loc' => '/index.html', 'priority' => '1.0', 'changefreq' => 'weekly'],
    ['loc' => '/store.html', 'priority' => '0.9', 'changefreq' => 'weekly'],
    ['loc' => '/blog.html', 'priority' => '0.8', 'changefreq' => 'daily'],
    ['loc' => '/booking.html', 'priority' => '0.8', 'changefreq' => 'weekly'],
    ['loc' => '/client-login.html', 'priority' => '0.7', 'changefreq' => 'monthly'],
    ['loc' => '/client-portal.html', 'priority' => '0.7', 'changefreq' => 'monthly'],
    ['loc' => '/creator-tools.html', 'priority' => '0.8', 'changefreq' => 'monthly'],
    ['loc' => '/movies-bot.html', 'priority' => '0.6', 'changefreq' => 'monthly'],
    ['loc' => '/booking.html', 'priority' => '0.8', 'changefreq' => 'weekly'],
];

// Get dynamic blog posts from database
$posts = [];
$blogPages = [];

$db_host = 'localhost';
$db_name = 'portfolio_db';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get blog posts
    $stmt = $pdo->query("SELECT slug, created_at FROM blog_posts WHERE is_published = 1");
    $blogPosts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($blogPosts as $post) {
        $blogPages[] = [
            'loc' => '/blog-post.html?slug=' . $post['slug'],
            'priority' => '0.7',
            'changefreq' => 'monthly',
            'lastmod' => date('Y-m-d', strtotime($post['created_at']))
        ];
    }

} catch (Exception $e) {
    // If database not available, continue with static pages
}

$allPages = array_merge($pages, $blogPages);

// Output XML
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

foreach ($allPages as $page) {
    echo '  <url>' . "\n";
    echo '    <loc>' . $baseUrl . $page['loc'] . '</loc>' . "\n";
    echo '    <changefreq>' . ($page['changefreq'] ?? 'weekly') . '</changefreq>' . "\n";
    echo '    <priority>' . ($page['priority'] ?? '0.5') . '</priority>' . "\n";
    if (isset($page['lastmod'])) {
        echo '    <lastmod>' . $page['lastmod'] . '</lastmod>' . "\n";
    } else {
        echo '    <lastmod>' . $lastmod . '</lastmod>' . "\n";
    }
    echo '  </url>' . "\n";
}

echo '</urlset>';
?>