package main

import (
	"context"
	"fmt"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
	"github.com/openai/openai-go/shared"
)

type LLM struct {
	model  string
	client openai.Client
}

func NewLLMClient(apiKey, model, baseURL string) *LLM {
	client := openai.NewClient(
		option.WithAPIKey(apiKey),
		option.WithBaseURL(BASE_URL),
	)
	return &LLM{
		model:  model,
		client: client,
	}
}

func (l *LLM) Generate(prompt, sysPrompt string) string {
	fmt.Println("正在调用大语言模型……")

	resp, err := l.client.Chat.Completions.New(
		context.Background(),
		openai.ChatCompletionNewParams{
			Model: shared.ChatModel(l.model),
			Messages: []openai.ChatCompletionMessageParamUnion{
				openai.SystemMessage(sysPrompt),
				openai.UserMessage(prompt),
			},
		},
	)

	if err != nil {
		fmt.Printf("调用大语言模型失败: %v\n", err)
		return "错误:调用语言模型服务时出错。"
	}

	answer := resp.Choices[0].Message.Content
	fmt.Println("大语言模型响应成功。")
	return answer
}
