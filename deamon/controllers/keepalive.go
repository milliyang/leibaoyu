package controllers

import (
	"bufio"
	"fmt"
	"github.com/astaxie/beego"
	"github.com/milliyang/leibaoyu/deamon/log"
	"github.com/milliyang/leibaoyu/server/debug"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

const (
	RELOAD_MAX_DEADLINE = 3600 // second
)

var (
	mutex       = &sync.Mutex{}
	watchingMap = map[string]bool{}
)

type Params struct {
	Seconds int64  `form:"deadline"`
	Program string `form:"program"`
	CWD     string `form:"cwd"`
	Padding string `form:"padding"`
}

type KeepaliveController struct {
	beego.Controller
}

func (this *KeepaliveController) Get() {

	// security check
	if this.Ctx.Input.IP() != "127.0.0.1" {
		this.Abort("401")
		return
	}

	params := Params{}
	this.ParseForm(&params)
	log.AntdLoger.Debug("watch program with params:%s", debug.JsonString(params))

	if params.Program == "" {
		this.Ctx.WriteString("[SKIP] invalid params")
		return
	} else {
		// check already watching
		mutex.Lock()
		defer mutex.Unlock()
		watching, ok := watchingMap[params.Program]
		if ok && watching {
			log.AntdLoger.Debug("[SKIP] already watching: %s", params.Program)
			this.Ctx.WriteString("[SKIP] already watching: " + params.Program)
			return
		} else {
			watchingMap[params.Program] = true
		}
	}

	// Hijack it before go keepaliveWorker()
	hj, ok := this.Ctx.ResponseWriter.(http.Hijacker)
	if !ok {
		http.Error(this.Ctx.ResponseWriter, "webserver doesn't support hijacking", http.StatusInternalServerError)
		return
	}
	conn, bufrw, err := hj.Hijack()
	if err != nil {
		http.Error(this.Ctx.ResponseWriter, err.Error(), http.StatusInternalServerError)
		return
	}
	go keepaliveWorker(conn, bufrw, this.Ctx.Request, params)
	return
}

func (this *KeepaliveController) Render() error {
	return nil
}

func keepaliveWorker(conn net.Conn, bufrw *bufio.ReadWriter, req *http.Request, params Params) {
	if params.Seconds == 0 {
		params.Seconds = RELOAD_MAX_DEADLINE
	}

	// Don't forget to close the connection:
	defer conn.Close()

	// set no deadline
	conn.SetDeadline(time.Now().Add(time.Second * 3600 * 24 * 360 * 5))

	for {
		s, err := bufrw.ReadString('\n')
		if err != nil {
			log.AntdLoger.Debug("socket read error:%s", err.Error())
			log.AntdLoger.Debug("restart program with params:%s", debug.JsonString(params))

			//
			mutex.Lock()
			watchingMap[params.Program] = false
			mutex.Unlock()

			startProcessWithParams(params)
			break
		} else {
			fmt.Println("recv: ", s)
			log.AntdLoger.Debug("recv: %s", s)
			if s == "QUIT\r\n" {
				bufrw.WriteString("QUITX\r\n")
				bufrw.Flush()
				//
				mutex.Lock()
				watchingMap[params.Program] = false
				mutex.Unlock()
				break
			}
		}
	}
}

func startProcessWithParams(params Params) {
	execCmd := params.Program + " " + params.Padding
	args := strings.Split(execCmd, " ")

	// debug.Println("os.Args:", os.Args)
	// debug.Println("os.Environ:", debug.JsonString(os.Environ()))
	// debug.Println("exec Args:", args)
	p, err := os.StartProcess(params.Program, args, &os.ProcAttr{
		Dir: params.CWD,
		Env: os.Environ()})
	if nil != err {
		log.AntdLoger.Debug("spawned child fail. %s %s", err.Error(), debug.JsonString(params))
		return
	}
	log.AntdLoger.Debug("spawned child : %d", p.Pid)

	st, err := p.Wait()
	fmt.Println("wait status:", st, err)
	p.Release()
}
