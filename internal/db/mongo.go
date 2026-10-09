package db

import (
	"context"
	"fmt"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

var Client *mongo.Client
var DB *mongo.Database

func Connect() error {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		return fmt.Errorf("MONGO_URI environment variable is not set")
	}

	dbName := os.Getenv("MONGO_DB_NAME")
	if dbName == "" {
		return fmt.Errorf("MONGO_DB_NAME environment variable is not set")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(clientOpts)
	if err != nil {
		return fmt.Errorf("failed to create MongoDB client: %v", err)
	}

	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return fmt.Errorf("failed to ping MongoDB: %v", err)
	}

	Client = client
	DB = client.Database(dbName)
	fmt.Printf("Connected successfully to MongoDB database: %s\n", dbName)

	return nil
}
