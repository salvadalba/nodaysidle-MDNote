-- Migration 003: FTS5 Search Index
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
    id UNINDEXED,
    title,
    content,
    tokenize = 'porter'
);
-- Triggers to sync FTS index
CREATE TRIGGER IF NOT EXISTS notes_ai
AFTER
INSERT ON notes BEGIN
INSERT INTO notes_fts(id, title, content)
VALUES (new.id, new.title, new.content);
END;
CREATE TRIGGER IF NOT EXISTS notes_ad
AFTER DELETE ON notes BEGIN
DELETE FROM notes_fts
WHERE id = old.id;
END;
CREATE TRIGGER IF NOT EXISTS notes_au
AFTER
UPDATE ON notes BEGIN
UPDATE notes_fts
SET title = new.title,
    content = new.content
WHERE id = new.id;
END;