package db

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

func New() (*sql.DB, error) {
	return sql.Open("sqlite", "./events.db")
}

func Init(db *sql.DB) error {

	_, err := db.Exec(`
        CREATE TABLE IF NOT EXISTS events(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time TEXT,
            ip TEXT,
            user_agent TEXT,
            action TEXT
        );
    `)

	return err
}
