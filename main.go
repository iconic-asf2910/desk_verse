package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/iconic-asf2910/vow/internal/db"
	"github.com/joho/godotenv"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "VOW backend is running")
}

func main() {

	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found, using environment variables")
	}

	if err := db.Connect(); err != nil {
		log.Fatalf("MongoDB connection error: %v", err)
	}

	http.HandleFunc("/health", healthHandler)

	fmt.Println("VOW backend running on :8080")

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Server error:", err)
	}
}
