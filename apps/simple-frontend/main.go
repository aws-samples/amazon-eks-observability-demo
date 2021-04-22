package main

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"time"

	"golang.org/x/net/context/ctxhttp"

	"github.com/aws/aws-xray-sdk-go/xray"
)

func init() {
	xrayDaemonAddr := os.Getenv("XRAY_ADDR")
	xray.Configure(xray.Config{
		DaemonAddr: xrayDaemonAddr,
		LogLevel:   "info",
	})
}

func main() {

	tr := &http.Transport{
		MaxIdleConns:    10,
		IdleConnTimeout: 30 * time.Second,
	}

	http.Handle("/api", xray.Handler(xray.NewFixedSegmentNamer("simple-frontend"), http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		backendEndpoint := os.Getenv("BACKEND_ENDPOINT")
		resp, err := ctxhttp.Get(r.Context(), xray.Client(&http.Client{Transport: tr}), backendEndpoint)

		if err != nil {
			fmt.Println(err)
			io.WriteString(w, "Unable to make request to: "+backendEndpoint)
			return
		}

		defer resp.Body.Close()

		if resp.StatusCode == http.StatusOK {
			body, err := ioutil.ReadAll(resp.Body)
			if err != nil {
				fmt.Println(err)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			io.WriteString(w, string(body))
		}

	})))

	// Write the landing page
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		io.WriteString(w, html)
	})

	http.ListenAndServe(":8080", nil)
}

var html = `<!DOCTYPE HTML><html>
<head><title>Simple Frontend</title></head>
<body><br><br>
<div id="api-response">
</div>
<script>
function get() {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", "/api", false );
	xmlHttp.send( null );
	return xmlHttp.responseText;
}
setInterval(function() { document.getElementById("api-response").innerHTML=get(); }, 1000);
</script>
</body></html>`
