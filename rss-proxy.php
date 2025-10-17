<?php
// Simple CORS proxy for RSS feeds
// Note: This requires a PHP server, won't work on GitHub Pages

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if (!isset($_GET['url'])) {
    http_response_code(400);
    echo json_encode(['error' => 'URL parameter required']);
    exit;
}

$url = $_GET['url'];

// Validate that it's a Google News RSS URL
if (strpos($url, 'news.google.com/rss') === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid RSS URL']);
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; RSS Reader)');
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && $response) {
    // Parse RSS and convert to JSON
    $xml = simplexml_load_string($response);
    if ($xml) {
        $items = [];
        $count = 0;
        foreach ($xml->channel->item as $item) {
            if ($count >= 50) break;
            
            $items[] = [
                'title' => (string)$item->title,
                'description' => (string)$item->description,
                'link' => (string)$item->link,
                'pubDate' => (string)$item->pubDate,
                'source' => 'Google News'
            ];
            $count++;
        }
        
        echo json_encode([
            'status' => 'ok',
            'items' => $items
        ]);
    } else {
        echo json_encode(['error' => 'Failed to parse RSS']);
    }
} else {
    echo json_encode(['error' => 'Failed to fetch RSS feed']);
}
?>
