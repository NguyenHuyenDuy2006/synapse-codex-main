<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

try {
    $sql = "
        SELECT 
            p.id, 
            p.name, 
            p.description, 
            DATE_FORMAT(p.created_at, '%Y-%m-%d') as created_at,
            COUNT(t.id) AS taskTotal,
            SUM(IF(t.status = 'done', 1, 0)) AS taskDone,
            (
                SELECT GROUP_CONCAT(DISTINCT u.username SEPARATOR ',') 
                FROM tasks t2 
                JOIN users u ON t2.assigned_to = u.id 
                WHERE t2.project_id = p.id
            ) AS members_raw
        FROM projects p
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id
        ORDER BY p.id DESC
    ";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Xử lý mảng members_raw thành array để khớp cấu trúc frontend
    foreach ($projects as &$project) {
        $project['taskTotal'] = (int)$project['taskTotal'];
        $project['taskDone'] = (int)($project['taskDone'] ?? 0);
        
        if (!empty($project['members_raw'])) {
            $project['members'] = explode(',', $project['members_raw']);
        } else {
            $project['members'] = [];
        }
        unset($project['members_raw']);
    }

    echo json_encode([
        "status" => true,
        "data" => $projects
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Lỗi CSDL: " . $e->getMessage()
    ]);
}
