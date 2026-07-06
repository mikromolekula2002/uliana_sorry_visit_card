package main

import (
	"log"
	"net/http"
	"os"

	_ "github.com/mattn/go-sqlite3"
	"github.com/mikromolekula2002/farewellCard/internal/db"
	handlers "github.com/mikromolekula2002/farewellCard/internal/handler"
	"github.com/mikromolekula2002/farewellCard/internal/logger"
	"github.com/mikromolekula2002/farewellCard/internal/models"
	repository "github.com/mikromolekula2002/farewellCard/internal/repo"
)

func main() {
	logger.Init()

	wd, _ := os.Getwd()
	log.Println("WORKDIR:", wd)

	dbConn, err := db.New()
	if err != nil {
		logger.Error.Fatal(err)
	}

	db.Init(dbConn)

	repo := &repository.EventRepository{
		Ch: make(chan models.Event, 1000),
		DB: dbConn,
	}

	handler := handlers.New(repo)
	mux := http.NewServeMux()
	handler.RegisterRoutes(mux)

	wrapped := handlers.LoggingMiddleware(mux)

	logger.Info.Println("Server started :80")
	log.Fatal(http.ListenAndServe(":80", wrapped))
}
