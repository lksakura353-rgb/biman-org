<?php
/**
 * Build script - generates minified versions of all front-end files
 * Run this to generate optimized versions: php minify-build.php
 */

$baseDir = __DIR__;
$minDir = $baseDir . '/min';
$sourceFiles = [
    'style.css' => 'css',
    'script.js' => 'js',
    'index.html' => 'html',
    'client-portal.html' => 'html',
    'client-login.html' => 'html',
];

if (!is_dir($minDir)) {
    mkdir($minDir, 0777);
}

function minifyHTML($html) {
    $html = preg_replace('/<!--(?!\s*(?:\[if [^\]]+|DOCTYPE))/s', '', $html);
    $html = preg_replace('/\s+/', ' ', $html);
    $html = preg_replace('/>\s+</', '><', $html);
    $html = preg_replace('/(\s+)(\w+)=("|\')?(\S+)(\3)/', ' $2=$4', $html);
    $html = str_replace(' decoding="async"', '', $html);
    return trim($html);
}

function minifyCSS($css) {
    $css = preg_replace('/\/\*[\s\S]*?\*\//', '', $css);
    $css = preg_replace('/\s+/', ' ', $css);
    $css = preg_replace('/\s*([{}:;,+*\/])\s*/', '$1', $css);
    $css = str_replace(';}', '}', $css);
    return trim($css);
}

function minifyJS($js) {
    $js = preg_replace('/\/\/[^\n]*/', '', $js);
    $js = preg_replace('/\/\*[\s\S]*?\*\//', '', $js);
    $js = preg_replace('/\s+/', ' ', $js);
    $js = preg_replace('/\s*([=+\-*/<>!&|,?:;])\s*/', '$1', $js);
    $js = preg_replace('/;(\s*})/', '$1', $js);
    return trim($js);
}

echo "=== Building Minified Files ===\n\n";
$totalSavings = 0;
$totalOriginal = 0;

foreach ($sourceFiles as $file => $type) {
    $filepath = $baseDir . '/' . $file;
    if (!file_exists($filepath)) {
        echo "Skipping $file - not found\n";
        continue;
    }

    $content = file_get_contents($filepath);
    $originalSize = strlen($content);

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
    }

    $minifiedSize = strlen($minified);
    $savings = $originalSize - $minifiedSize;
    $percent = round($savings / $originalSize * 100, 1);

    $outputFile = $minDir . '/min-' . $file;
    file_put_contents($outputFile, $minified);

    echo "✓ min-$file\n";
    echo "  Original: " . round($originalSize/1024, 1) . " KB → Minified: " . round($minifiedSize/1024, 1) . " KB (saved $percent%)\n\n";

    $totalSavings += $savings;
    $totalOriginal += $originalSize;
}

echo "=== Summary ===\n";
echo "Total original: " . round($totalOriginal/1024, 1) . " KB\n";
echo "Total minified: " . round(($totalOriginal-$totalSavings)/1024, 1) . " KB\n";
echo "Total savings: " . round($totalSavings/1024, 1) . " KB (" . round($totalSavings/$totalOriginal*100, 1) . "%)\n";
echo "\nMinified files saved to: $minDir/\n";
?>