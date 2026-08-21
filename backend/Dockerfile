FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/flocksense ./cmd/server

FROM alpine:3.22
RUN adduser -D -u 10001 appuser
COPY --from=build /out/flocksense /flocksense
USER appuser
EXPOSE 8080
ENTRYPOINT ["/flocksense"]
