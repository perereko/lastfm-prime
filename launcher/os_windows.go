//go:build windows

package main

import (
	"syscall"
	"unsafe"
)

var (
	user32       = syscall.NewLazyDLL("user32.dll")
	kernel32     = syscall.NewLazyDLL("kernel32.dll")
	pMessageBox  = user32.NewProc("MessageBoxW")
	pCreateMutex = kernel32.NewProc("CreateMutexW")
	pWaitSingle  = kernel32.NewProc("WaitForSingleObject")
	pRelease     = kernel32.NewProc("ReleaseMutex")
	pCloseHandle = kernel32.NewProc("CloseHandle")
)

func binaryName() string { return appName + ".exe" }

// fail mostra o erro numa janela do Windows (o lançador não tem console)
func fail(msg string) {
	t, _ := syscall.UTF16PtrFromString(appName)
	m, _ := syscall.UTF16PtrFromString(msg)
	const mbIconError = 0x10
	pMessageBox.Call(0, uintptr(unsafe.Pointer(m)), uintptr(unsafe.Pointer(t)), mbIconError)
}

// lock evita que dois cliques seguidos extraiam o app ao mesmo tempo
func lock(_ string) func() {
	name, _ := syscall.UTF16PtrFromString(`Local\LastfmPrimeExtract`)
	h, _, _ := pCreateMutex.Call(0, 0, uintptr(unsafe.Pointer(name)))
	if h == 0 {
		return func() {}
	}
	pWaitSingle.Call(h, 120000)
	return func() {
		pRelease.Call(h)
		pCloseHandle.Call(h)
	}
}
