package main

import (
	"encoding/json"
	"io"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-xray-sdk-go/xray"
)

const appName = "simple-backend"

func init() {
	xrayDaemonAddr := os.Getenv("XRAY_ADDR")
	xray.Configure(xray.Config{
		DaemonAddr: xrayDaemonAddr,
		LogLevel:   "info",
	})
}

func main() {

	http.Handle("/", xray.Handler(xray.NewFixedSegmentNamer(appName), http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		res := &response{Message: "42 - The Answer to the Ultimate Question of Life, The Universe, and Everything.", Random: []int{}}

		count := time.Now().Second()
		gen := random(res)

		_, seg := xray.BeginSubsegment(r.Context(), appName+"-gen")

		for i := 0; i < count; i++ {
			gen()
		}

		seg.Close(nil)

		// Beautify the JSON output - only for display
		out, _ := json.MarshalIndent(res, "", "  ")

		w.Header().Set("Content-Type", "application/json")
		io.WriteString(w, string(out))

	})))
	http.ListenAndServe(":8080", nil)
}

type response struct {
	Message string `json:"message"`
	Random  []int  `json:"random"`
}

func random(res *response) func() {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	return func() {
		res.Random = append(res.Random, r.Intn(42))
	}
}
