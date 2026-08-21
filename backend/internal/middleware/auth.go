package middleware

import (
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func Auth(secret []byte) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
		token, err := jwt.Parse(header, func(t *jwt.Token) (any, error) {
			if t.Method != jwt.SigningMethodHS256 {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return secret, nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(401, gin.H{"error": gin.H{"code": "UNAUTHORIZED", "message": "valid bearer token required"}})
			return
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatus(401)
			return
		}
		if farmerID, ok := claims["farmer_id"].(string); ok && farmerID != "" {
			c.Set("farmer_id", farmerID)
			c.Set("role", "farmer")
		} else if userID, ok := claims["user_id"].(string); ok && userID != "" {
			c.Set("user_id", userID)
			c.Set("role", claims["role"])
			c.Set("cooperative_id", claims["cooperative_id"])
		} else {
			c.AbortWithStatusJSON(401, gin.H{"error": gin.H{"code": "UNAUTHORIZED", "message": "token identity is missing"}})
			return
		}
		c.Next()
	}
}

func RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetString("role") != role {
			c.AbortWithStatusJSON(403, gin.H{"error": gin.H{"code": "FORBIDDEN", "message": "insufficient role"}})
			return
		}
		c.Next()
	}
}
