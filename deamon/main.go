package main

import (
	_ "ant/antdeamon/routers"
	"fmt"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/logs"
	"github.com/milliyang/leibaoyu/deamon/log"
)

var (
	AntdLoger *logs.BeeLogger
)

const (
	_INFO_STARTED  = "[Deamon] started"
	_INFO_LOG_FILE = "[Deamon] journal log: ./deamon.log"
	_INFO_EXIT     = "[Deamon] exit"
)

func main() {
	fmt.Println(_INFO_STARTED)
	fmt.Println(_INFO_LOG_FILE)
	log.AntdLoger.Debug(_INFO_STARTED)
	beego.Run()
	fmt.Println(_INFO_EXIT)
	log.AntdLoger.Debug(_INFO_EXIT)
}
