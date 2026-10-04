package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/iconic-asf2910/vow/internal/auth"
	"github.com/iconic-asf2910/vow/internal/db"
	"github.com/iconic-asf2910/vow/internal/meeting"
	"github.com/iconic-asf2910/vow/internal/middleware"
	"github.com/iconic-asf2910/vow/internal/room"
	"github.com/iconic-asf2910/vow/internal/workspace"
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
	http.HandleFunc("/api/auth/signup", auth.Signup)
	http.HandleFunc("/api/auth/login", auth.Login)
	http.HandleFunc("/api/workspaces", middleware.RequireAuth(workspace.HandleWorkspaces))
	http.HandleFunc("/api/workspaces/", middleware.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		// /api/workspaces/{id} or /api/workspaces/{id}/rooms
		path := r.URL.Path
		if strings.Contains(path, "/rooms") {
			room.HandleRooms(w, r)
		} else {
			workspace.HandleWorkspaceByID(w, r)
		}
	}))
	http.HandleFunc("/api/rooms/", middleware.RequireAuth(room.HandleRoomByID))
	http.HandleFunc("/api/meetings", middleware.RequireAuth(meeting.HandleMeetings))
	http.HandleFunc("/api/meetings/", middleware.RequireAuth(meeting.HandleMeetingByID))

	fmt.Println("VOW backend running on :8080")

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Server error:", err)
	}
}
