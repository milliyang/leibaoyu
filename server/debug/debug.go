package debug

import (
	"encoding/json"
	"fmt"
	"os"
	"runtime"
	_ "strconv"
	_ "strings"
)

const (
	DEBUG_PRINT = false
)

func JsonPrint(obj interface{}) {
	if !DEBUG_PRINT {
		return
	}
	b, err := json.Marshal(obj)
	if err != nil {
		fmt.Println("error:", err)
		return
	}
	os.Stdout.Write(b)
	fmt.Println("")
}

func Println(a ...interface{}) {
	if !DEBUG_PRINT {
		return
	}
	pc, file, line, ok := runtime.Caller(1)
	if ok {
		info := fmt.Sprintf("DUMP:%s %s:%d ", runtime.FuncForPC(pc).Name(), file, line)
		fmt.Fprintln(os.Stdout, info)
	}
	fmt.Fprintln(os.Stdout, a...)
}

func Print(a ...interface{}) {
	if !DEBUG_PRINT {
		return
	}
	pc, file, line, ok := runtime.Caller(1)
	if ok {
		info := fmt.Sprintf("DUMP:%s %s:%d ", runtime.FuncForPC(pc).Name(), file, line)
		fmt.Fprintln(os.Stdout, info)
	}
	fmt.Print(a...)
}

func Printf(format string, a ...interface{}) {
	if !DEBUG_PRINT {
		return
	}
	pc, file, line, ok := runtime.Caller(1)
	if ok {
		info := fmt.Sprintf("DUMP:%s %s:%d ", runtime.FuncForPC(pc).Name(), file, line)
		fmt.Fprintln(os.Stdout, info)
	}
	fmt.Printf(format, a...)
}

func Location() string {
	// use runtime.Caller(1) instead of runtime.Caller(0)
	pc, file, line, ok := runtime.Caller(1)
	if ok {
		info := fmt.Sprintf("DUMP:%s %s:%d ", runtime.FuncForPC(pc).Name(), file, line)
		return info
	} else {
		return "DUMP:Unknown pc "
	}
}

func JsonString(obj interface{}) string {
	b, err := json.Marshal(obj)
	if err != nil {
		fmt.Println("JsonString error:", err)
		return ""
	}
	return string(b)
}
