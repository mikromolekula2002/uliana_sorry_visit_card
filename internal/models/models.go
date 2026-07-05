package models

import "time"

type Event struct {
	Action string
	IP     string
	UA     string
	Time   time.Time
}
