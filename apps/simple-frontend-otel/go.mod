module github.com/literalice/simple-frontend-otel

go 1.16

require (
	github.com/gorilla/mux v1.8.0
	go.opentelemetry.io/contrib/detectors/aws/eks v0.19.0
	go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux v0.19.0
	go.opentelemetry.io/contrib/propagators/aws v0.19.0
	go.opentelemetry.io/otel v0.19.0
	go.opentelemetry.io/otel/exporters/otlp v0.19.0
	go.opentelemetry.io/otel/metric v0.19.0
	go.opentelemetry.io/otel/sdk v0.19.0
	golang.org/x/net v0.0.0-20210410081132-afb366fc7cd1
	golang.org/x/sys v0.0.0-20210403161142-5e06dd20ab57 // indirect
	google.golang.org/genproto v0.0.0-20210406143921-e86de6bf7a46 // indirect
	google.golang.org/grpc v1.37.0 // indirect
)
