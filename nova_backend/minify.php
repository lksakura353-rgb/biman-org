<?php
// ============================================================
//  minify.php  — Minify HTML, CSS, and JS files for better performance
// ============================================================

header('Content-Type: text/plain');

// Simple minification functions
function minifyHTML($html) {
    // Remove comments (except IE comments)
    $html = preg_replace('/<!--(?!\s*(?:\[if [^\]]+|DOCTYPE))/s', '', $html);
    $html = preg_replace('/-->/', '-->', $html);

    // Remove extra whitespace
    $html = preg_replace('/\s+/', ' ', $html);

    // Remove whitespace around tags
    $html = preg_replace('/>\s+</', '><', $html);

    // Remove quotes from attributes where possible
    $html = preg_replace('/(\s+)(\w+)=("|\')?(\S+)(\3)/', ' $2=$4', $html);

    // Remove trailing semicolons before closing tag
    $html = str_replace(';</script>', '</script>', $html);
    $html = str_replace(';</style>', '</style>', $html);

    // Remove unnecessary attributes
    $html = str_replace(' decoding="async"', '', $html);
    $html = str_replace(' type="text/javascript"', '', $html);

    // Remove empty attributes
    $html = preg_replace('/\s+class=""\s*/', ' ', $html);
    $html = preg_replace('/\s+id=""\s*/', ' ', $html);

    return trim($html);
}

function minifyCSS($css) {
    // Remove comments
    $css = preg_replace('/\/\*[\s\S]*?\*\//', '', $css);

    // Remove extra whitespace
    $css = preg_replace('/\s+/', ' ', $css);

    // Remove whitespace around punctuation
    $css = preg_replace('/\s*([{}:;,+*\/])\s*/', '$1', $css);

    // Remove trailing semicolons before closing braces
    $css = str_replace(';}', '}', $css);

    // Remove unnecessary zeros
    $css = preg_replace('/(\d+)px/', '${1}px', $css);
    $css = str_replace(':0px', ':0', $css);
    $css = str_replace(':0%', ':0%', $css);

    // Remove default values
    $css = str_replace('; ;', ';', $css);

    return trim($css);
}

function minifyJS($js) {
    // Remove single line comments
    $js = preg_replace('/\/\/[^\n]*/', '', $js);

    // Remove multi-line comments
    $js = preg_replace('/\/\*[\s\S]*?\*\//', '', $js);

    // Remove extra whitespace
    $js = preg_replace('/\s+/', ' ', $js);

    // Remove whitespace around operators
    $js = preg_replace('/\s*([=+\-*/<>!&|,?:;])\s*/', '$1', $js);

    // Remove unnecessary semicolons at end of blocks
    $js = preg_replace('/;(\s*})/', '$1', $js);

    // Remove var/let/const keywords where not needed
    $js = preg_replace('/\b(var|let|const)\s+/', '', $js);

    return trim($js);
}

// Process request
$file = $_GET['file'] ?? '';
$type = $_GET['type'] ?? '';

if (empty($file)) {
    echo "Usage: minify.php?file=filename&type=html|css|js\n\n";
    echo "Examples:\n";
    echo "  minify.php?file=index.html&type=html\n";
    echo "  minify.php?file=style.css&type=css\n";
    echo "  minify.php?file=script.js&type=js\n";
    exit;
}

$baseDir = dirname(__DIR__);
$filepath = $baseDir . '/' . $file;

if (!file_exists($filepath)) {
    echo "Error: File not found: $filepath\n";
    exit;
}

$content = file_get_contents($filepath);

switch ($type) {
    case 'html':
        $minified = minifyHTML($content);
        break;
    case 'css':
        $minified = minifyCSS($content);
        break;
    case 'js':
        $minified = minifyJS($content);
        break;
    default:
        echo "Error: Invalid type. Use html, css, or js.\n";
        exit;
}

// Output results
echo "Original size: " . strlen($content) . " bytes (" . round(strlen($content)/1024, 2) . " KB)\n";
echo "Minified size: " . strlen($minified) . " bytes (" . round(strlen($minified)/1024, 2) . " KB)\n";
echo "Savings: " . round((strlen($content) - strlen($minified)) / strlen($content) * 100, 1) . "%\n\n";

// Option to save
if (isset($_GET['save'])) {
    $outputFile = $baseDir . '/min/' . basename($file);
    @mkdir(dirname($outputFile), 0777, true);
    file_put_contents($outputFile, $minified);
    echo "Saved to: $outputFile\n\n";
}

echo "=== MINIFIED OUTPUT ===\n";
echo $minified;
?>