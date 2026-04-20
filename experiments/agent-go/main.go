package main

import (
	"fmt"
	"log"
	"os"
	"regexp"
	"strings"

	"github.com/fatih/color"
	"github.com/joho/godotenv"
)

const (
	BASE_URL         = "https://api.deepseek.com"
	MODEL_ID         = "deepseek-chat"
	AGENT_SYS_PROMPT = `你是一个智能旅行助手。你的任务是分析用户的请求，并使用可用工具一步步地解决问题。

# 可用工具:
- "get_weather(city: str)": 查询指定城市的实时天气。
- "get_attraction(city: str, weather: str)": 根据城市和天气搜索推荐的旅游景点。

# 输出格式要求:
你的每次回复必须严格遵循以下格式，包含一对Thought和Action：

Thought: [你的思考过程和下一步计划]
Action: [你要执行的具体行动]

Action的格式必须是以下之一：
1. 调用工具：function_name(arg_name="arg_value")
2. 结束任务：Finish[最终答案]

# 重要提示:
- 每次只输出一对Thought-Action
- Action必须在同一行，不要换行
- 当收集到足够信息可以回答用户问题时，必须使用 Action: Finish[最终答案] 格式结束

请开始吧！`
)

// 统一定义工具
type ToolFunc func(args map[string]string) string

var availableTools = map[string]ToolFunc{
	"get_weather":    func(args map[string]string) string { return GetWeather(args["city"]) },
	"get_attraction": func(args map[string]string) string { return GetAttraction(args["city"], args["weather"]) },
}

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Println(".env 未加载")
	}
}

func main() {
	info := color.New(color.FgHiBlack)
	step := color.New(color.FgCyan)
	output := color.New(color.FgBlue, color.Bold)

	apiKey := os.Getenv("DEEPSEEK_API_KEY")

	llm := NewLLMClient(apiKey, MODEL_ID, BASE_URL)

	userPrompt := "你好，请帮我查询一下今天东京的天气，然后根据天气推荐一个合适的旅游景点。"
	promptHistory := []string{fmt.Sprintf("用户请求：%s", userPrompt)}

	fmt.Printf("用户输入：%s\n", userPrompt)

	for i := range 5 {
		fmt.Printf("-------------------< 迭代第 %d 轮 >-------------------\n", i+1)

		fullPrompt := strings.Join(promptHistory, "\n")

		llmOutput := llm.Generate(fullPrompt, AGENT_SYS_PROMPT)

		re := regexp.MustCompile(`(?s)(Thought:[\s\S]*?Action:[^\n\r]*)`)
		match := re.FindStringSubmatch(llmOutput)

		if len(match) > 1 {
			truncated := strings.TrimSpace(match[1])

			if truncated != strings.TrimSpace(llmOutput) {
				llmOutput = truncated
				fmt.Println("已截断多余的 Thought-Action 对")
			}
		}

		info.Printf("模型输出:\n%s\n\n", llmOutput)
		promptHistory = append(promptHistory, llmOutput)

		// 提取 Action
		reAction := regexp.MustCompile(`(?s)Action:\s*(.*)`)
		actionMatch := reAction.FindStringSubmatch(llmOutput)
		if len(actionMatch) < 2 {
			observation := "错误: 未能解析到 Action 字段。请确保你的回复严格遵循 'Thought: ... Action: ...' 的格式。"
			observationResult := fmt.Sprintf("Observation: %s", observation)

			fmt.Printf("%s\n%s\n", observationResult, strings.Repeat("=", 40))
			promptHistory = append(promptHistory, observationResult)
			continue
		}

		// 完成任务
		actionStr := strings.TrimSpace(actionMatch[1])
		if strings.HasPrefix(actionStr, "Finish") {
			reFinish := regexp.MustCompile(`Finish\[(.*)\]`)
			m := reFinish.FindStringSubmatch(actionStr)

			if len(m) > 1 {
				finalAnswer := m[1]
				output.Printf("任务完成，最终答案: %s\n", finalAnswer)
			}
			break
		}

		// 解析工具调用
		reTool := regexp.MustCompile(`(\w+)\(`)
		toolMatch := reTool.FindStringSubmatch(actionStr)
		toolName := toolMatch[1]

		reArgs := regexp.MustCompile(`\((.*)\)`)
		argsMatch := reArgs.FindStringSubmatch(actionStr)
		argsStr := argsMatch[1]

		reKwargs := regexp.MustCompile(`(\w+)="([^"]*)"`)
		kwargsMatches := reKwargs.FindAllStringSubmatch(argsStr, -1)

		kwargs := make(map[string]string)
		for _, m := range kwargsMatches {
			if len(m) == 3 {
				kwargs[m[1]] = m[2]
			}
		}

		var observation string
		if tool, ok := availableTools[toolName]; ok {
			observation = tool(kwargs)
		} else {
			observation = fmt.Sprintf("错误:未定义的工具 '%s'", toolName)
		}

		observationResult := fmt.Sprintf("Observation: %s", observation)
		step.Printf("%s\n", observationResult)
		promptHistory = append(promptHistory, observationResult)
	}
}
