CREATE TABLE IF NOT EXISTS linkvertiseCache (
    ip varchar(1024) NOT NULL PRIMARY KEY,
    firstEarn timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    link text NOT NULL,
    earnedCount INT NOT NULL DEFAULT 0
);