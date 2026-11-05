//go:build windows

// lfprime-janelas: ajudante do Last.fm PRIME que cuida das janelas do player (o navegador escondido).
//
// O app manda comandos pela entrada padrão, um por linha:
//
//	watch <pid>   cuida das janelas desse processo (o navegador do player)
//	front         traz para a frente as janelas do player que aparecerem na tela nos próximos segundos
//	sweep         confere todas as janelas agora
//	ping          responde "pong"
//
// As regras são só duas, pela posição da janela:
//   - fora da tela (estacionada pelo app): sem botão na barra de tarefas e fora do Alt+Tab;
//   - na tela (uma janela de login do Facebook/Google, ou o player que você pediu para ver):
//     janela normal, com botão, e na frente do app quando pedido.
//
// Reage na hora em que a janela aparece ou se move (ganchos de eventos do Windows) e confere tudo
// de novo a cada 250 ms. Fecha sozinho quando o app fecha (a entrada padrão termina).
package main

import (
	"bufio"
	"fmt"
	"os"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
	"unsafe"
)

var (
	user32   = syscall.NewLazyDLL("user32.dll")
	kernel32 = syscall.NewLazyDLL("kernel32.dll")

	procEnumWindows              = user32.NewProc("EnumWindows")
	procGetWindowThreadProcessId = user32.NewProc("GetWindowThreadProcessId")
	procGetWindowLongPtrW        = user32.NewProc("GetWindowLongPtrW")
	procSetWindowLongPtrW        = user32.NewProc("SetWindowLongPtrW")
	procShowWindow               = user32.NewProc("ShowWindow")
	procIsWindowVisible          = user32.NewProc("IsWindowVisible")
	procIsIconic                 = user32.NewProc("IsIconic")
	procIsWindow                 = user32.NewProc("IsWindow")
	procGetWindowRect            = user32.NewProc("GetWindowRect")
	procGetClassNameW            = user32.NewProc("GetClassNameW")
	procGetWindow                = user32.NewProc("GetWindow")
	procSetWindowPos             = user32.NewProc("SetWindowPos")
	procSetForegroundWindow      = user32.NewProc("SetForegroundWindow")
	procBringWindowToTop         = user32.NewProc("BringWindowToTop")
	procSetWinEventHook          = user32.NewProc("SetWinEventHook")
	procGetMessageW              = user32.NewProc("GetMessageW")
	procSetTimer                 = user32.NewProc("SetTimer")
	procPostThreadMessageW       = user32.NewProc("PostThreadMessageW")
	procGetCurrentThreadId       = kernel32.NewProc("GetCurrentThreadId")
)

const (
	gwlStyle   = -16
	gwlExStyle = -20

	wsChild         = 0x40000000
	wsCaption       = 0x00C00000
	wsPopup         = 0x80000000
	wsExToolWindow  = 0x00000080
	wsExAppWindow   = 0x00040000
	gwOwner         = 4
	swHide          = 0
	swShowNoActive  = 4
	swpNoSize       = 0x0001
	swpNoMove       = 0x0002
	swpNoActivate   = 0x0010
	swpShowWindow   = 0x0040
	eventObjShow    = 0x8002
	eventObjLocChg  = 0x800B
	wineventOutCtx  = 0x0000
	wineventSkipOwn = 0x0002
	wmTimer         = 0x0113
	wmApp           = 0x8000

	offScreen = -10000 // o app estaciona as janelas em -20000
)

var (
	hwndTopmost   = ^uintptr(0) // -1
	hwndNoTopmost = ^uintptr(1) // -2
)

type rect struct{ Left, Top, Right, Bottom int32 }

type msg struct {
	Hwnd    uintptr
	Message uint32
	WParam  uintptr
	LParam  uintptr
	Time    uint32
	X, Y    int32
	Private uint32
}

// o que sabemos de cada janela do player
type win struct {
	orig    uintptr // estilo estendido original (antes de tirarmos da barra de tarefas)
	styled  bool    // tiramos da barra de tarefas
	fronted bool    // já trouxemos para a frente desde que apareceu na tela
}

var (
	mu         sync.Mutex
	watchPid   uint32
	frontUntil time.Time

	// só a linha de mensagens mexe nestes
	wins = map[uintptr]*win{}
)

func idx(i int) uintptr { return uintptr(i) } // índices negativos (GWL_EXSTYLE) para a chamada

func getLong(h uintptr, i int) uintptr {
	r, _, _ := procGetWindowLongPtrW.Call(h, idx(i))
	return r
}

func setLong(h uintptr, i int, v uintptr) { procSetWindowLongPtrW.Call(h, idx(i), v) }

func className(h uintptr) string {
	buf := make([]uint16, 128)
	n, _, _ := procGetClassNameW.Call(h, uintptr(unsafe.Pointer(&buf[0])), uintptr(len(buf)))
	if n == 0 {
		return ""
	}
	return syscall.UTF16ToString(buf[:n])
}

func current() (uint32, time.Time) {
	mu.Lock()
	defer mu.Unlock()
	return watchPid, frontUntil
}

// restyle esconde a janela, troca o estilo e mostra de novo sem ativar (é assim que a barra de tarefas percebe)
func restyle(h, ex uintptr) {
	procShowWindow.Call(h, swHide)
	setLong(h, gwlExStyle, ex)
	procShowWindow.Call(h, swShowNoActive)
}

func front(h uintptr) {
	// por um instante "sempre por cima" e de volta ao normal: sobe na frente do app sem ficar preso por cima
	procSetWindowPos.Call(h, hwndTopmost, 0, 0, 0, 0, swpNoMove|swpNoSize|swpShowWindow)
	procSetWindowPos.Call(h, hwndNoTopmost, 0, 0, 0, 0, swpNoMove|swpNoSize|swpShowWindow)
	procBringWindowToTop.Call(h)
	procSetForegroundWindow.Call(h)
}

func handle(h uintptr) {
	pid, fu := current()
	if pid == 0 || h == 0 {
		return
	}
	var p uint32
	procGetWindowThreadProcessId.Call(h, uintptr(unsafe.Pointer(&p)))
	if p != pid {
		return
	}
	style := getLong(h, gwlStyle)
	if style&wsChild != 0 || (style&wsPopup != 0 && style&wsCaption != wsCaption) {
		return // só janelas de verdade; balões, avisos e menus (janelas "popup" sem barra de título) ficam como estão
	}
	if owner, _, _ := procGetWindow.Call(h, gwOwner); owner != 0 {
		return // janelas com dono (menus, balões) nunca vão para a barra de tarefas
	}
	if !strings.HasPrefix(className(h), "Chrome_WidgetWin_") {
		return
	}
	if v, _, _ := procIsWindowVisible.Call(h); v == 0 {
		return
	}
	w := wins[h]
	if w == nil {
		w = &win{}
		wins[h] = w
	}
	if ic, _, _ := procIsIconic.Call(h); ic != 0 {
		// uma janela estacionada que foi minimizada (Win+M, por exemplo) volta para o lugar dela, fora da tela,
		// sem ativar; as outras minimizadas ficam como estão (senão você não teria como abrir de novo)
		if w.styled {
			procShowWindow.Call(h, swShowNoActive)
		}
		return
	}
	var r rect
	procGetWindowRect.Call(h, uintptr(unsafe.Pointer(&r)))
	ex := getLong(h, gwlExStyle)
	if r.Left <= offScreen || r.Top <= offScreen {
		w.fronted = false
		want := (ex | wsExToolWindow) &^ wsExAppWindow
		if want != ex {
			if !w.styled {
				w.orig = ex
				w.styled = true
			}
			restyle(h, want)
		}
		return
	}
	// na tela: janela normal
	if w.styled {
		w.styled = false
		restyle(h, w.orig&^wsExToolWindow)
	} else if ex&wsExToolWindow != 0 && ex&wsExAppWindow == 0 {
		restyle(h, ex&^wsExToolWindow)
	}
	if !w.fronted && time.Now().Before(fu) {
		w.fronted = true
		front(h)
	}
}

var enumList []uintptr
var enumCb = syscall.NewCallback(func(h, _ uintptr) uintptr {
	enumList = append(enumList, h)
	return 1
})

func sweep() {
	if pid, _ := current(); pid == 0 {
		return
	}
	enumList = enumList[:0]
	procEnumWindows.Call(enumCb, 0)
	for _, h := range enumList {
		handle(h)
	}
	for h := range wins {
		if ok, _, _ := procIsWindow.Call(h); ok == 0 {
			delete(wins, h)
		}
	}
}

var eventCb = syscall.NewCallback(func(hook, event, hwnd, idObject, idChild, thread, t uintptr) uintptr {
	if int32(idObject) == 0 && int32(idChild) == 0 {
		handle(hwnd)
	}
	return 0
})

func main() {
	tidc := make(chan uintptr, 1)
	go loop(tidc)
	tid := <-tidc
	poke := func() { procPostThreadMessageW.Call(tid, wmApp, 0, 0) }

	out := bufio.NewWriter(os.Stdout)
	fmt.Fprintln(out, "ready")
	out.Flush()

	in := bufio.NewScanner(os.Stdin)
	for in.Scan() {
		f := strings.Fields(in.Text())
		if len(f) == 0 {
			continue
		}
		switch f[0] {
		case "watch":
			if len(f) > 1 {
				if n, err := strconv.ParseUint(f[1], 10, 32); err == nil {
					mu.Lock()
					watchPid = uint32(n)
					mu.Unlock()
				}
			}
			poke()
		case "front":
			mu.Lock()
			frontUntil = time.Now().Add(4 * time.Second)
			mu.Unlock()
			procPostThreadMessageW.Call(tid, wmApp+1, 0, 0)
		case "sweep":
			poke()
		case "ping":
			fmt.Fprintln(out, "pong")
			out.Flush()
		case "quit":
			os.Exit(0)
		}
	}
	os.Exit(0) // o app fechou
}

// loop: a linha que recebe os eventos de janela do Windows e o relógio da conferência
func loop(tidc chan<- uintptr) {
	runtime.LockOSThread()
	tid, _, _ := procGetCurrentThreadId.Call()
	procSetWinEventHook.Call(eventObjShow, eventObjShow, 0, eventCb, 0, 0, wineventOutCtx|wineventSkipOwn)
	procSetWinEventHook.Call(eventObjLocChg, eventObjLocChg, 0, eventCb, 0, 0, wineventOutCtx|wineventSkipOwn)
	procSetTimer.Call(0, 0, 250, 0)
	tidc <- tid
	var m msg
	for {
		r, _, _ := procGetMessageW.Call(uintptr(unsafe.Pointer(&m)), 0, 0, 0)
		if int32(r) <= 0 {
			return
		}
		switch m.Message {
		case wmTimer, wmApp:
			sweep()
		case wmApp + 1: // "front": as janelas na tela vêm para a frente de novo, mesmo as que já vieram antes
			for _, w := range wins {
				w.fronted = false
			}
			sweep()
		}
	}
}
