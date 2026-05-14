<?php
// ============================================================
//  blog.php  — Blog API with categories, posts, comments
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

    // Create blog tables
    $pdo->exec("CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        excerpt TEXT,
        content TEXT NOT NULL,
        image_url VARCHAR(255),
        category VARCHAR(100),
        tags VARCHAR(255),
        author VARCHAR(100) DEFAULT 'Biman Ranasinghe',
        views INT DEFAULT 0,
        is_published TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS blog_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        comment TEXT NOT NULL,
        is_approved TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS blog_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE,
        description VARCHAR(255),
        color VARCHAR(20) DEFAULT '#ccff00'
    )");

    // Seed sample blog posts if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM blog_posts");
    if ($stmt->fetchColumn() == 0) {
        $posts = [
            [
                'title' => 'How to Create Viral YouTube Thumbnails in 2025',
                'slug' => 'create-viral-youtube-thumbnails-2025',
                'excerpt' => 'Learn the secrets to creating thumbnails that get clicked. Top tips from a professional content creator.',
                'content' => '<h2>Introduction</h2><p>Creating viral thumbnails is an art form. In this guide, I will share my top secrets...</p><h2>1. Use Bold Colors</h2><p>Colors that stand out are key to getting those clicks. Use high contrast and vibrant hues...</p><h2>2. Face Emotions</h2><p>People connect with emotions. Make exaggerated facial expressions...</p><h2>3. Big Text</h2><p>Your title should be readable even on mobile. Use bold, sans-serif fonts...</p><h2>Conclusion</h2><p>Remember, thumbnails are the first impression. Make it count!</p>',
                'image_url' => 'https://i.postimg.cc/0yXBM7yW/image.png',
                'category' => 'Design',
                'tags' => 'youtube,thumbnail,design,tips'
            ],
            [
                'title' => 'Best Video Editing Software for Beginners in 2025',
                'slug' => 'best-video-editing-software-beginners-2025',
                'excerpt' => 'Starting your video editing journey? Here are the best software options for beginners.',
                'content' => '<h2>Why Video Editing Matters</h2><p>Video is the future of content. Whether you are a YouTuber, marketer, or creative...</p><h2>Top Picks</h2><h3>1. CapCut</h3><p>Free, easy to use, great for mobile...</p><h3>2. Premiere Pro</h3><p>Industry standard, powerful features...</p><h3>3. DaVinci Resolve</h3><p>Best color grading, free version available...</p>',
                'image_url' => 'https://i.postimg.cc/q7dpYf8z/image.png',
                'category' => 'Tutorial',
                'tags' => 'video,editing,software,tutorial'
            ],
            [
                'title' => 'Color Grading Secrets: Cinematic LUTs Explained',
                'slug' => 'color-grading-cinematic-luts-explained',
                'excerpt' => 'Unlock the power of LUTs to transform your videos from amateur to cinematic.',
                'content' => '<h2>What are LUTs?</h2><p>LUT stands for Look Up Table. It is a color transformation preset...</p><h2>Types of LUTs</h2><p>There are technical and creative LUTs. Technical LUTs fix exposure, while creative ones add style...</p><h2>How to Use</h2><p>In Premiere Pro: Go to Lumetri Color > Creative > Browse...</p>',
                'image_url' => 'https://i.postimg.cc/G2P2mLjC/A-DESIGN-BY-202604230844.jpg',
                'category' => 'Tutorials',
                'tags' => 'color grading,luts,cinematic,video'
            ],
            [
                'title' => 'My Content Creation Journey: From Beginner to Pro',
                'slug' => 'my-content-creation-journey',
                'excerpt' => 'My story of how I started creating content and built a successful career.',
                'content' => '<h2>The Beginning</h2><p>It started with a simple idea - sharing my passion for video editing...</p><h2>Challenges</h2><p>Every journey has obstacles. Low views, negative comments, burnout...</p><h2>Lessons Learned</h2><p>Consistency is key. Quality over quantity. Engage with your audience...</p>',
                'image_url' => 'https://i.postimg.cc/9fP6Ggbf/image.png',
                'category' => 'Story',
                'tags' => 'journey,story,content creator,motivation'
            ],
            [
                'title' => 'Adobe Premiere Pro Shortcuts That Will Speed Up Your Editing',
                'slug' => 'adobe-premiere-pro-shortcuts',
                'excerpt' => 'Master these essential keyboard shortcuts to edit 10x faster.',
                'content' => '<h2>Essential Shortcuts</h2><p><strong>J/K/L</strong> - Playback control (reverse/pause/forward)</p><p><strong>C</strong> - Razor tool</p><p><strong>V</strong> - Selection tool</p><p><strong>Q</strong> - Ripple trim left</p><p><strong>W</strong> - Ripple trim right</p><p><strong>Ctrl+D</strong> - Default transitions</p>',
                'image_url' => 'https://i.postimg.cc/WpYQ6kGX/image.png',
                'category' => 'Tips',
                'tags' => 'premiere,shortcuts,tips,editing'
            ]
        ];

        $insert = $pdo->prepare("INSERT INTO blog_posts (title, slug, excerpt, content, image_url, category, tags) VALUES (?, ?, ?, ?, ?, ?, ?)");
        foreach ($posts as $p) {
            $insert->execute([$p['title'], $p['slug'], $p['excerpt'], $p['content'], $p['image_url'], $p['category'], $p['tags']]);
        }
    }

    // Seed categories if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM blog_categories");
    if ($stmt->fetchColumn() == 0) {
        $categories = [
            ['name' => 'Tutorials', 'slug' => 'tutorials', 'description' => 'Step-by-step guides', 'color' => '#ccff00'],
            ['name' => 'Design', 'slug' => 'design', 'description' => 'Design tips & tricks', 'color' => '#ff6b6b'],
            ['name' => 'Tips', 'slug' => 'tips', 'description' => 'Quick tips & hacks', 'color' => '#4ecdc4'],
            ['name' => 'Story', 'slug' => 'story', 'description' => 'Personal stories', 'color' => '#a855f7']
        ];

        $insert = $pdo->prepare("INSERT INTO blog_categories (name, slug, description, color) VALUES (?, ?, ?, ?)");
        foreach ($categories as $c) {
            $insert->execute([$c['name'], $c['slug'], $c['description'], $c['color']]);
        }
    }

} catch (PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'DB Error: ' . $e->getMessage()]));
}

// ============================================================
//  API Actions
// ============================================================
$action = $_GET['action'] ?? '';

// GET ALL POSTS
if ($action === 'get_posts') {
    $category = $_GET['category'] ?? '';
    $search = $_GET['search'] ?? '';
    $limit = $_GET['limit'] ?? 10;
    $offset = $_GET['offset'] ?? 0;

    $sql = "SELECT * FROM blog_posts WHERE is_published = 1";
    $params = [];

    if ($category) {
        $sql .= " AND category = ?";
        $params[] = $category;
    }

    if ($search) {
        $sql .= " AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Add reading time
    foreach ($posts as &$post) {
        $wordCount = str_word_count(strip_tags($post['content']));
        $post['reading_time'] = ceil($wordCount / 200);
    }

    echo json_encode(['success' => true, 'posts' => $posts]);
    exit;
}

// GET SINGLE POST
if ($action === 'get_post') {
    $slug = $_GET['slug'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE slug = ? AND is_published = 1");
    $stmt->execute([$slug]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($post) {
        // Increment views
        $pdo->exec("UPDATE blog_posts SET views = views + 1 WHERE id = " . $post['id']);

        // Get comments
        $stmt = $pdo->prepare("SELECT * FROM blog_comments WHERE post_id = ? AND is_approved = 1 ORDER BY created_at DESC");
        $stmt->execute([$post['id']]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Add reading time
        $wordCount = str_word_count(strip_tags($post['content']));
        $post['reading_time'] = ceil($wordCount / 200);
        $post['comments'] = $comments;
        $post['comment_count'] = count($comments);

        echo json_encode(['success' => true, 'post' => $post]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Post not found']);
    }
    exit;
}

// GET CATEGORIES
if ($action === 'get_categories') {
    $stmt = $pdo->query("SELECT bc.*, COUNT(bp.id) as post_count
        FROM blog_categories bc
        LEFT JOIN blog_posts bp ON bc.name = bp.category AND bp.is_published = 1
        GROUP BY bc.id
        ORDER BY bc.name");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'categories' => $categories]);
    exit;
}

// ADD COMMENT
if ($action === 'add_comment') {
    $input = json_decode(file_get_contents('php://input'), true);
    $postId = $input['post_id'] ?? 0;
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $comment = trim($input['comment'] ?? '');

    if (!$postId || !$name || !$comment) {
        echo json_encode(['success' => false, 'message' => 'All fields required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO blog_comments (post_id, name, email, comment) VALUES (?, ?, ?, ?)");
        $stmt->execute([$postId, $name, $email, $comment]);
        echo json_encode(['success' => true, 'message' => 'Comment posted! It will appear after approval.']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error posting comment']);
    }
    exit;
}

// GET RECENT POSTS
if ($action === 'get_recent') {
    $stmt = $pdo->query("SELECT id, title, slug, excerpt, image_url, category, created_at
        FROM blog_posts WHERE is_published = 1 ORDER BY created_at DESC LIMIT 5");
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'posts' => $posts]);
    exit;
}

// GET POPULAR POSTS
if ($action === 'get_popular') {
    $stmt = $pdo->query("SELECT id, title, slug, image_url, views FROM blog_posts
        WHERE is_published = 1 ORDER BY views DESC LIMIT 5");
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'posts' => $posts]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>