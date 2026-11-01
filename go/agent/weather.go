package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

type WeatherResponse struct {
	CurrentCondition []struct {
		TempC       string `json:"temp_C"`
		WeatherDesc []struct {
			Value string `json:"value"`
		} `json:"weatherDesc"`
	} `json:"current_condition"`
}

func GetWeather(city string) string {
	url := fmt.Sprintf(
		"https://wttr.in/%s?format=j1",
		url.QueryEscape(city),
	)

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		return fmt.Sprintf("错误: 查询天气时遇到网络问题 - %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Sprintf("错误: 查询失败，HTTP 状态码 %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Sprintf("错误: 读取响应失败 - %v", err)
	}

	var data WeatherResponse
	if err := json.Unmarshal(body, &data); err != nil {
		return fmt.Sprintf("错误: 解析天气数据失败 - %v", err)
	}

	if len(data.CurrentCondition) == 0 || len(data.CurrentCondition[0].WeatherDesc) == 0 {
		return "错误: 解析天气数据失败，可能是城市名称无效"
	}

	condition := data.CurrentCondition[0]
	weatherDesc := condition.WeatherDesc[0].Value
	tempC := condition.TempC

	return fmt.Sprintf("%s当前天气:%s，气温%s摄氏度", city, weatherDesc, tempC)
}
