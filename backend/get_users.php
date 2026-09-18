<?php
// Cấu hình CORS để Frontend (Next.js) gọi được API
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Chống trình duyệt lưu cache dữ liệu cũ
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Xử lý preflight request của trình duyệt
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Kết nối CSDL
require_once 'config.php';

try {
    // Lấy id, username và full_name từ bảng users
    $stmt = $conn->prepare("SELECT id, username, full_name FROM users ORDER BY id ASC");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Trả về JSON thành công
    echo json_encode([
        "status" => true, 
        "data" => $users
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    // Xử lý nếu có lỗi database
    http_response_code(500);
    echo json_encode([
        "status" => false, 
        "message" => "Lỗi CSDL: " . $e->getMessage()
    ]);
}