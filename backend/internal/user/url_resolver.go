package user

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"
)

var (
	pinImgRegex   = regexp.MustCompile(`https://i\.pinimg\.com/(?:736x|474x|originals|564x)/[a-f0-9/]+\.(?:jpg|jpeg|png|webp)`)
	ogImageRegex  = regexp.MustCompile(`<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']`)
	ogImageRegex2 = regexp.MustCompile(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']`)
)

// ResolveAvatarURL resolves web page URLs (Pinterest, Google Drive, Google Images) into direct image URLs
func ResolveAvatarURL(rawURL string) string {
	rawURL = strings.TrimSpace(rawURL)
	if rawURL == "" {
		return ""
	}

	// 1. Google Drive Links
	if strings.Contains(rawURL, "drive.google.com") {
		re := regexp.MustCompile(`drive\.google\.com/file/d/([a-zA-Z0-9_-]+)`)
		matches := re.FindStringSubmatch(rawURL)
		if len(matches) > 1 {
			return fmt.Sprintf("https://lh3.googleusercontent.com/d/%s", matches[1])
		}
		reID := regexp.MustCompile(`drive\.google\.com/(?:uc|open)\?.*id=([a-zA-Z0-9_-]+)`)
		matchesID := reID.FindStringSubmatch(rawURL)
		if len(matchesID) > 1 {
			return fmt.Sprintf("https://lh3.googleusercontent.com/d/%s", matchesID[1])
		}
	}

	// 2. Google Image Search Result Links (extract imgurl query param)
	if strings.Contains(rawURL, "google.com/imgres") || strings.Contains(rawURL, "google.co.id/imgres") {
		parsed, err := url.Parse(rawURL)
		if err == nil {
			if imgParam := parsed.Query().Get("imgurl"); imgParam != "" {
				return ResolveAvatarURL(imgParam)
			}
		}
	}

	// 3. Pinterest Pin Links (pin.it or pinterest.com/pin/)
	if strings.Contains(rawURL, "pin.it") || strings.Contains(rawURL, "pinterest.com/pin/") {
		resolved := fetchPinterestImage(rawURL)
		if resolved != "" {
			return resolved
		}
	}

	return rawURL
}

func fetchPinterestImage(pinURL string) string {
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	req, err := http.NewRequest("GET", pinURL, nil)
	if err != nil {
		return ""
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")

	resp, err := client.Do(req)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(io.LimitReader(resp.Body, 512*1024))
	if err != nil {
		return ""
	}
	bodyStr := string(bodyBytes)

	// Check og:image meta tag
	ogMatch := ogImageRegex.FindStringSubmatch(bodyStr)
	if len(ogMatch) > 1 && strings.Contains(ogMatch[1], "http") {
		return ogMatch[1]
	}

	ogMatch2 := ogImageRegex2.FindStringSubmatch(bodyStr)
	if len(ogMatch2) > 1 && strings.Contains(ogMatch2[1], "http") {
		return ogMatch2[1]
	}

	// Check direct i.pinimg.com regex match
	pinMatch := pinImgRegex.FindString(bodyStr)
	if pinMatch != "" {
		return pinMatch
	}

	return ""
}
