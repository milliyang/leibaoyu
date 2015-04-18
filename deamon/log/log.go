package log

import (
	"github.com/astaxie/beego/logs"
)

var (
	AntdLoger *logs.BeeLogger
)

func init() {
	AntdLoger = logs.NewLogger(10000)
	AntdLoger.SetLogger("file", `{"filename":"deamon.log"}`)
}
