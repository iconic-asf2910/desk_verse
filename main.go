package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/iconic-asf2910/vow/internal/analytics"
	"github.com/iconic-asf2910/vow/internal/auth"
	"github.com/iconic-asf2910/vow/internal/db"
	"github.com/iconic-asf2910/vow/internal/gaming"
	"github.com/iconic-asf2910/vow/internal/meeting"
	"github.com/iconic-asf2910/vow/internal/message"
	"github.com/iconic-asf2910/vow/internal/middleware"
	"github.com/iconic-asf2910/vow/internal/poll"
	"github.com/iconic-asf2910/vow/internal/presence"
	"github.com/iconic-asf2910/vow/internal/room"
	"github.com/iconic-asf2910/vow/internal/signaling"
	"github.com/iconic-asf2910/vow/internal/task"
	"github.com/iconic-asf2910/vow/internal/transcript"
	"github.com/iconic-asf2910/vow/internal/workspace"
	"github.com/joho/godotenv"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "VOW backend is running")
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		allowedOrigins := map[string]bool{
			"http://localhost:5173": true,
			"http://localhost:3000": true,
			"http://127.0.0.1:3000": true,
		}
		if allowedOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {

	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found, using environment variables")
	}

	if err := db.Connect(); err != nil {
		log.Fatalf("MongoDB connection error: %v", err)
	}

	hub := signaling.NewHub()

	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/api/auth/signup", auth.Signup)
	http.HandleFunc("/api/auth/login", auth.Login)
	http.HandleFunc("/api/auth/logout", middleware.RequireAuth(auth.Logout))
	http.HandleFunc("/api/workspaces", middleware.RequireAuth(workspace.HandleWorkspaces))
	http.HandleFunc("/api/workspaces/", middleware.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if strings.Contains(path, "/rooms") {
			room.HandleRooms(w, r)
		} else {
			workspace.HandleWorkspaceByID(w, r)
		}
	}))
	http.HandleFunc("/api/rooms/", middleware.RequireAuth(room.HandleRoomByID))
	http.HandleFunc("/api/meetings", middleware.RequireAuth(meeting.HandleMeetings))
	http.HandleFunc("/api/messages/", middleware.RequireAuth(message.HandleMessageByID))
	http.HandleFunc("/api/messages", middleware.RequireAuth(message.HandleMessages))
	http.HandleFunc("/api/tasks/", middleware.RequireAuth(task.HandleTaskByID))
	http.HandleFunc("/api/tasks", middleware.RequireAuth(task.HandleTasks))
	http.HandleFunc("/api/polls/", middleware.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if strings.Contains(path, "/vote") {
			poll.HandlePollVote(w, r)
		} else if strings.Contains(path, "/close") {
			poll.HandlePollClose(w, r)
		} else {
			poll.HandlePollByID(w, r)
		}
	}))
	http.HandleFunc("/api/polls", middleware.RequireAuth(poll.HandlePolls))
	http.HandleFunc("/api/presence/", middleware.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPut {
			presence.UpdatePresenceStatus(w, r)
		} else {
			presence.GetPresence(w, r)
		}
	}))
	http.HandleFunc("/api/presence", middleware.RequireAuth(presence.HandlePresence))
	http.HandleFunc("/api/analytics", middleware.RequireAuth(analytics.HandleAnalytics))
	http.HandleFunc("/api/gaming/", middleware.RequireAuth(gaming.HandleGamingByID))
	http.HandleFunc("/api/gaming", middleware.RequireAuth(gaming.HandleGaming))
	http.HandleFunc("/api/meetings/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if strings.Contains(path, "/ws") {
			signaling.HandleWS(hub, w, r)
		} else if strings.Contains(path, "/transcript") {
			middleware.RequireAuth(transcript.HandleTranscript)(w, r)
		} else {
			middleware.RequireAuth(meeting.HandleMeetingByID)(w, r)
		}
	})

	fmt.Println("VOW backend running on :8080")

	err := http.ListenAndServe(":8080", corsMiddleware(http.DefaultServeMux))
	if err != nil {
		fmt.Println("Server error:", err)
	}
}
