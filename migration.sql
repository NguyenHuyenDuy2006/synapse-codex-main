-- Chạy script này trong phpMyAdmin để tạo thêm bảng cho chức năng quản lý dự án & task

CREATE TABLE IF NOT EXISTS `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `assigned_to` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('task','assign','doing','done','review','error') NOT NULL DEFAULT 'task',
  `progress` int(11) NOT NULL DEFAULT 0,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Thêm một dự án mẫu để test
INSERT INTO `projects` (`name`, `description`) VALUES
('Website E-commerce', 'Dự án xây dựng trang web bán hàng trực tuyến');

-- Thêm một task mẫu (Giả sử project_id=1 và user_id=1)
INSERT INTO `tasks` (`project_id`, `assigned_to`, `title`, `description`, `status`, `progress`, `due_date`) VALUES
(1, 1, 'Thiết kế Database', 'Tạo sơ đồ ERD và viết script SQL', 'done', 100, '2026-09-20');
