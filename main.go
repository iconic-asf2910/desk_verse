package main

import (
	"fmt"
	"net/http"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "VOW backend is running")
}

func main() {
	http.HandleFunc("/health", healthHandler)

	fmt.Println("VOW backend running on :8080")

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Server error:", err)
	}
}
