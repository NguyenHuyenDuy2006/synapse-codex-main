<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$input = file_get_contents("php://input");
$data = json_decode($input, true);

$name = isset($data['name']) ? trim($data['name']) : '';
$description = isset($data['description']) ? trim($data['description']) : '';

if (empty($name)) {
    http_response_code(400);
    echo json_encode(["status" => false, "message" => "Tên dự án không được để trống."]);
    exit();
}

try {
    $sql = "INSERT INTO projects (name, description) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$name, $description]);
    
    $new_id = $conn->lastInsertId();

    echo json_encode([
        "status" => true,
        "message" => "Tạo dự án thành công!",
        "data" => [
            "id" => $new_id,
            "name" => $name,
            "description" => $description
        ]
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Lỗi CSDL: " . $e->getMessage()
    ]);
}
