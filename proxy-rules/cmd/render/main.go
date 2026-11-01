package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/QiYuOr2/labs/proxy-rules/internal/rules"
)

func main() {
	check := flag.Bool("check", false, "只比较已经生成的文件，不写回")
	flag.Usage = func() {
		fmt.Fprintf(flag.CommandLine.Output(), "用法: render [-check]\n根据 config/all.ini 生成 FlClash、Quantumult X、Shadowrocket 配置。\n")
		flag.PrintDefaults()
	}
	flag.Parse()
	if flag.NArg() != 0 {
		flag.Usage()
		os.Exit(2)
	}
	cwd, err := os.Getwd()
	if err != nil {
		fail(err)
	}
	root, err := rules.FindRoot(cwd)
	if err != nil {
		fail(err)
	}
	files, err := rules.Render(root)
	if err != nil {
		fail(err)
	}
	if *check {
		if err := rules.Same(root, files); err != nil {
			fail(err)
		}
		fmt.Println("ok")
		return
	}
	if err := rules.Write(root, files); err != nil {
		fail(err)
	}
	for _, name := range rules.ClientFiles() {
		fmt.Println("wrote", name)
	}
}

func fail(err error) {
	fmt.Fprintf(os.Stderr, "error: %v\n", err)
	os.Exit(1)
}
