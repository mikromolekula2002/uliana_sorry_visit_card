package repository

import (
	"database/sql"
	"time"

	"github.com/mikromolekula2002/farewellCard/internal/logger"
	"github.com/mikromolekula2002/farewellCard/internal/models"
)

type EventRepository struct {
	DB *sql.DB
	Ch chan models.Event
}

func (r *EventRepository) StartWorker() {
	go func() {
		for e := range r.Ch {

			_, err := r.DB.Exec(`
				INSERT INTO events(time, ip, user_agent, action)
				VALUES(?,?,?,?)
			`,
				e.Time.Format(time.RFC3339),
				e.IP,
				e.UA,
				e.Action,
			)

			if err != nil {
				logger.Error.Println("DB ERROR INSERT :", err)
			}
		}
	}()
}

func (r *EventRepository) Save(e models.Event) {
	select {
	case r.Ch <- e:
	default:
	}
}
