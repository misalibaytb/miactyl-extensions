INSERT INTO config (name, value) VALUES 
('linkvertise_enabled', 1),
('linkvertise_userId', ''),
('linkvertise_earn', 10),
('linkvertise_limit', 2),
('linkvertise_limitTime', 1.75) ON DUPLICATE KEY UPDATE value = value;