package handlers

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/mikromolekula2002/farewellCard/internal/logger"
	"github.com/mikromolekula2002/farewellCard/internal/models"
)

func (h *Handler) Event(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		log.Println("METHOD NOT ALLOWED:")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var event models.Event

	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		log.Println("JSON DECODER:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	event.Time = time.Now()
	event.IP = clientIP(r)
	event.UA = r.UserAgent()

	h.Repo.Save(event)

	logger.Info.Printf("EVENT HANDLER: event add to queue | ip=%s | action=%s | ua=%s", event.IP, event.Action, event.UA)

	w.WriteHeader(http.StatusOK)
}

func clientIP(r *http.Request) string {

	ip := r.Header.Get("X-Forwarded-For")

	if ip != "" {
		return strings.Split(ip, ",")[0]
	}

	ip = r.Header.Get("X-Real-IP")

	if ip != "" {
		return ip
	}

	host, _, _ := net.SplitHostPort(r.RemoteAddr)

	return host
}
