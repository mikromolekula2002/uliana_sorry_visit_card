package handlers

import (
	"net/http"
	"time"

	"github.com/mikromolekula2002/farewellCard/internal/logger"
	repository "github.com/mikromolekula2002/farewellCard/internal/repo"
)

type Handler struct {
	Repo *repository.EventRepository
}

func New(repo *repository.EventRepository) *Handler {
	return &Handler{
		Repo: repo,
	}
}

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		start := time.Now()

		next.ServeHTTP(w, r)

		logger.Info.Printf("MIDDLEWARE: %s %s %s %v", r.Method, r.URL.Path, r.RemoteAddr, time.Since(start))
	})
}

func (h *Handler) RegisterRoutes(mux *http.ServeMux) {

	mux.Handle("/", http.FileServer(http.Dir("./web")))

	mux.HandleFunc("/api/event", h.Event)
}
