package routers

import (
	"github.com/astaxie/beego"
	"github.com/milliyang/leibaoyu/deamon/controllers"
)

func init() {
	beego.Router("/", &controllers.MainController{})
	beego.Router("/keepalive", &controllers.KeepaliveController{})
}
