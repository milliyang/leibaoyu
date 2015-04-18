package routers

import (
	"github.com/milliyang/leibaoyu/server/controllers"
	"github.com/astaxie/beego"
)

func init() {
    beego.Router("/", &controllers.MainController{})
}
