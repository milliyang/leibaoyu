package controllers

import (
	"github.com/astaxie/beego"
)

type MainController struct {
	beego.Controller
}

func (this *MainController) Get() {
	this.Data["Website"] = "LeiBaoYu.deamon"
	this.Data["Email"] = "thyang@imaginevision-tech.com"
	this.TplNames = "index.tpl"
}
