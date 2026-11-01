package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/QiYuOr2/labs/proxy-rules/internal/rules"
)

func main() {
	flag.Usage = func() {
		fmt.Fprintf(flag.CommandLine.Output(), "用法: check\n校验策略组、AI 固定节点、规则顺序，以及仓库里有没有机场订阅。\n")
	}
	flag.Parse()
	if flag.NArg() != 0 {
		flag.Usage()
		os.Exit(2)
	}
	cwd, err := os.Getwd()
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
	root, err := rules.FindRoot(cwd)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
	summary, err := rules.Check(root)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("ok: %d groups, %d rulesets\n", summary.Groups, summary.Rulesets)
}
