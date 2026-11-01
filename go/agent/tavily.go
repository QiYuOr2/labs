package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

type TavilyResponse struct {
	Query  string `json:"query"`
	Answer string `json:"answer"`

	Results []struct {
		Title   string `json:"title"`
		Content string `json:"content"`
	} `json:"results"`
}

func tavilySearch(apiKey, query string) (*TavilyResponse, error) {
	url := "https://api.tavily.com/search"
	payload := map[string]any{
		"query":          query,
		"search_depth":   "basic",
		"max_results":    1,
		"include_answer": false,
	}
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	req.Header.Add("Authorization", "Bearer "+apiKey)
	req.Header.Add("Content-Type", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Tavily API 请求报错: %s", res.Status)
	}

	var response TavilyResponse
	if err := json.NewDecoder(res.Body).Decode(&response); err != nil {
		return nil, err
	}

	return &response, nil
}

func GetAttraction(city, weather string) string {
	apiKey := os.Getenv("TAVILY_API_KEY")
	if apiKey == "" {
		return "TAVILY_API_KEY 未设置"
	}

	query := fmt.Sprintf("%s 在 %s 天气下最值得去的旅游景点推荐及理由", city, weather)
	response, err := tavilySearch(apiKey, query)
	if err != nil {
		return "错误：执行 TavilySearch 时出现问题 - " + err.Error()
	}

	if answer := response.Answer; answer != "" {
		return answer
	}

	formattedResults := []string{}
	if len(response.Results) == 0 {
		return "抱歉，没有找到相关的旅游景点推荐。"
	}
	for _, result := range response.Results {
		formattedResults = append(formattedResults, fmt.Sprintf("%s: %s", result.Title, result.Content))
	}

	return fmt.Sprintf("根据搜索，为您找到以下信息:\n %s", strings.Join(formattedResults, "\n"))
}
