package transcript

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

	"github.com/iconic-asf2910/vow/internal/db"
	"github.com/iconic-asf2910/vow/internal/middleware"
	"github.com/iconic-asf2910/vow/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

const mlServiceURL = "http://localhost:8000/api/ai/transcribe"

type MLResponse struct {
	Result string `json:"result"`
	Status string `json:"status"`
}

func HandleTranscript(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		CreateTranscript(w, r)
	case http.MethodGet:
		GetTranscript(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func collection() *mongo.Collection {
	if db.DB == nil {
		return nil
	}
	return db.DB.Collection("transcripts")
}

func meetingCollection() *mongo.Collection {
	if db.DB == nil {
		return nil
	}
	return db.DB.Collection("meetings")
}

func getUserID(r *http.Request) string {
	val := r.Context().Value(middleware.UserIDKey)
	if val == nil {
		return ""
	}
	if s, ok := val.(string); ok {
		return s
	}
	return ""
}

func getMeetingIDFromPath(r *http.Request) string {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	for i, part := range parts {
		if part == "meetings" && i+1 < len(parts) {
			return parts[i+1]
		}
	}
	return ""
}

func CreateTranscript(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	meetingID := getMeetingIDFromPath(r)
	if meetingID == "" {
		http.Error(w, "Meeting ID required", http.StatusBadRequest)
		return
	}

	objID, err := bson.ObjectIDFromHex(meetingID)
	if err != nil {
		http.Error(w, "Invalid meeting ID", http.StatusBadRequest)
		return
	}

	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "Database connection error", http.StatusInternalServerError)
			return
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var meeting models.Meeting
	err = meetingCollection().FindOne(ctx, bson.M{"_id": objID}).Decode(&meeting)
	if err != nil {
		http.Error(w, "Meeting not found", http.StatusNotFound)
		return
	}

	if err := r.ParseMultipartForm(50 << 20); err != nil {
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("audio")
	if err != nil {
		http.Error(w, "Audio file required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("audio", handler.Filename)
	if err != nil {
		http.Error(w, "Failed to create form file", http.StatusInternalServerError)
		return
	}

	if _, err := io.Copy(part, file); err != nil {
		http.Error(w, "Failed to copy file", http.StatusInternalServerError)
		return
	}

	writer.Close()

	req, err := http.NewRequest("POST", mlServiceURL, body)
	if err != nil {
		http.Error(w, "Failed to create ML request", http.StatusInternalServerError)
		return
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to connect to ML service: %v", err), http.StatusServiceUnavailable)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "ML service returned error", http.StatusInternalServerError)
		return
	}

	var mlResp MLResponse
	if err := json.NewDecoder(resp.Body).Decode(&mlResp); err != nil {
		http.Error(w, "Failed to parse ML response", http.StatusInternalServerError)
		return
	}

	if mlResp.Status != "success" {
		http.Error(w, "ML transcription failed", http.StatusInternalServerError)
		return
	}

	transcript := &models.Transcript{
		MeetingID:  meetingID,
		UserID:     userID,
		Transcript: mlResp.Result,
		CreatedAt:  time.Now(),
	}

	ctx2, cancel2 := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel2()

	col := collection()
	result, err := col.InsertOne(ctx2, transcript)
	if err != nil {
		http.Error(w, "Failed to save transcript", http.StatusInternalServerError)
		return
	}

	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		transcript.ID = oid
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(transcript)
}

func GetTranscript(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	meetingID := getMeetingIDFromPath(r)
	if meetingID == "" {
		http.Error(w, "Meeting ID required", http.StatusBadRequest)
		return
	}

	objID, err := bson.ObjectIDFromHex(meetingID)
	if err != nil {
		http.Error(w, "Invalid meeting ID", http.StatusBadRequest)
		return
	}

	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "Database connection error", http.StatusInternalServerError)
			return
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var meeting models.Meeting
	err = meetingCollection().FindOne(ctx, bson.M{"_id": objID}).Decode(&meeting)
	if err != nil {
		http.Error(w, "Meeting not found", http.StatusNotFound)
		return
	}

	ctx2, cancel2 := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel2()

	var transcript models.Transcript
	err = collection().FindOne(ctx2, bson.M{"meetingId": meetingID}).Decode(&transcript)
	if err != nil {
		http.Error(w, "Transcript not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transcript)
}
