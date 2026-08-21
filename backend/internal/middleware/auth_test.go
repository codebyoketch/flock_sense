package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func TestRequireRole(t *testing.T) {
	gin.SetMode(gin.TestMode)
	for _, test := range []struct {
		name, role string
		want       int
	}{
		{name: "farmer allowed", role: "farmer", want: http.StatusOK},
		{name: "admin rejected", role: "cooperative_admin", want: http.StatusForbidden},
	} {
		t.Run(test.name, func(t *testing.T) {
			r := gin.New()
			r.Use(func(c *gin.Context) { c.Set("role", test.role); c.Next() }, RequireRole("farmer"))
			r.GET("/", func(c *gin.Context) { c.Status(http.StatusOK) })
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			res := httptest.NewRecorder()
			r.ServeHTTP(res, req)
			if res.Code != test.want {
				t.Fatalf("expected %d, got %d", test.want, res.Code)
			}
		})
	}
}

func TestAuthRejectsUnexpectedAlgorithm(t *testing.T) {
	secret := []byte("test-secret")
	token := jwt.NewWithClaims(jwt.SigningMethodNone, jwt.MapClaims{"farmer_id": "farmer-1"})
	value, _ := token.SignedString(jwt.UnsafeAllowNoneSignatureType)
	r := gin.New()
	r.Use(Auth(secret))
	r.GET("/", func(c *gin.Context) { c.Status(http.StatusOK) })
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "Bearer "+value)
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusUnauthorized {
		t.Fatalf("expected unauthorized, got %d", res.Code)
	}
}
