package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/QiYuOr2/labs/proxy-rules/api"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	mux := http.NewServeMux()
	mux.HandleFunc("/api/qx", handler.Handler)
	fmt.Println("listening on :" + port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
