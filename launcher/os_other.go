//go:build !windows

package main

import (
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// Fora do Windows o lançador serve para testar o pacote (Linux)
func binaryName() string { return "electron" }

func fail(msg string) { fmt.Fprintln(os.Stderr, msg) }

func lock(root string) func() {
	p := filepath.Join(root, ".trava")
	for i := 0; i < 1200; i++ {
		f, err := os.OpenFile(p, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0o644)
		if err == nil {
			f.Close()
			return func() { os.Remove(p) }
		}
		time.Sleep(100 * time.Millisecond)
	}
	return func() {}
}
