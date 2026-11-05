// Lançador portátil do Last.fm PRIME.
//
// Um único .exe que carrega o app inteiro dentro de si. Na primeira vez (e a cada versão nova)
// ele extrai o app numa pasta de cache do Windows e o abre; nas outras vezes abre na hora.
// Logins e configurações ficam na pasta "Last.fm PRIME - dados", ao lado do .exe, então dá
// para levar tudo num pendrive.
package main

import (
	"archive/zip"
	"bytes"
	"crypto/sha256"
	_ "embed"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

//go:embed payload.zip
var payload []byte

const appName = "Last.fm PRIME"

func main() {
	if err := run(); err != nil {
		fail("Não deu para abrir o Last.fm PRIME.\n\n" + err.Error())
		os.Exit(1)
	}
}

func run() error {
	self, err := os.Executable()
	if err != nil {
		return err
	}
	if p, e := filepath.EvalSymlinks(self); e == nil {
		self = p
	}
	dataDir := filepath.Join(filepath.Dir(self), appName+" - dados")
	if !writable(dataDir) {
		// pasta só de leitura (ex.: Arquivos de Programas): usa a pasta do usuário
		if cfg, e := os.UserConfigDir(); e == nil {
			dataDir = filepath.Join(cfg, appName)
		}
	}

	sum := sha256.Sum256(payload)
	id := hex.EncodeToString(sum[:])[:16]
	cache, err := os.UserCacheDir()
	if err != nil {
		cache = os.TempDir()
	}
	root := filepath.Join(cache, appName, "runtime")
	target := filepath.Join(root, id)
	ready := filepath.Join(target, ".pronto")

	if !exists(ready) {
		if err := os.MkdirAll(root, 0o755); err != nil {
			return fmt.Errorf("sem permissão para criar %s: %w", root, err)
		}
		unlock := lock(root)
		if !exists(ready) {
			if err := extract(root, target); err != nil {
				unlock()
				return err
			}
		}
		unlock()
		go cleanup(root, id)
	}

	exe := filepath.Join(target, binaryName())
	cmd := exec.Command(exe, os.Args[1:]...)
	cmd.Dir = target
	cmd.Env = append(os.Environ(), "LFS_DATA_DIR="+dataDir, "LFS_LAUNCHER="+self)
	if hasArg("--self-test") {
		cmd.Stdout, cmd.Stderr = os.Stdout, os.Stderr
		return cmd.Run()
	}
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("o app não iniciou: %w", err)
	}
	_ = cmd.Process.Release()
	// dá tempo para a limpeza de versões antigas terminar
	time.Sleep(300 * time.Millisecond)
	return nil
}

// extract descompacta o app numa pasta temporária e só depois renomeia: nunca fica um app pela metade
func extract(root, target string) error {
	tmp := fmt.Sprintf("%s.tmp-%d", target, os.Getpid())
	_ = os.RemoveAll(tmp)
	zr, err := zip.NewReader(bytes.NewReader(payload), int64(len(payload)))
	if err != nil {
		return fmt.Errorf("pacote do app corrompido: %w", err)
	}
	for _, f := range zr.File {
		name := filepath.FromSlash(f.Name)
		if strings.Contains(name, "..") {
			continue
		}
		dst := filepath.Join(tmp, name)
		if f.FileInfo().IsDir() {
			if err := os.MkdirAll(dst, 0o755); err != nil {
				return err
			}
			continue
		}
		if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
			return err
		}
		if err := writeFile(f, dst); err != nil {
			_ = os.RemoveAll(tmp)
			return fmt.Errorf("falha ao preparar o app (%s): %w", f.Name, err)
		}
	}
	if err := os.WriteFile(filepath.Join(tmp, ".pronto"), []byte(time.Now().Format(time.RFC3339)), 0o644); err != nil {
		return err
	}
	_ = os.RemoveAll(target)
	if err := os.Rename(tmp, target); err != nil {
		if exists(filepath.Join(target, ".pronto")) {
			_ = os.RemoveAll(tmp)
			return nil
		}
		return fmt.Errorf("falha ao instalar o app no cache: %w", err)
	}
	return nil
}

func writeFile(f *zip.File, dst string) error {
	rc, err := f.Open()
	if err != nil {
		return err
	}
	defer rc.Close()
	mode := f.Mode().Perm()
	if mode == 0 {
		mode = 0o644
	}
	out, err := os.OpenFile(dst, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, mode|0o200)
	if err != nil {
		return err
	}
	if _, err := io.Copy(out, rc); err != nil {
		out.Close()
		return err
	}
	return out.Close()
}

// cleanup apaga versões antigas do app no cache (as que estiverem em uso ficam para a próxima)
func cleanup(root, keep string) {
	entries, err := os.ReadDir(root)
	if err != nil {
		return
	}
	for _, e := range entries {
		n := e.Name()
		if n == keep || strings.HasPrefix(n, keep+".tmp") || !e.IsDir() {
			continue
		}
		if strings.Contains(n, ".tmp-") {
			if info, err := e.Info(); err == nil && time.Since(info.ModTime()) < time.Hour {
				continue
			}
		}
		_ = os.RemoveAll(filepath.Join(root, n))
	}
}

func writable(dir string) bool {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return false
	}
	probe := filepath.Join(dir, ".teste-escrita")
	if err := os.WriteFile(probe, []byte("ok"), 0o644); err != nil {
		return false
	}
	_ = os.Remove(probe)
	return true
}

func exists(p string) bool {
	_, err := os.Stat(p)
	return !errors.Is(err, os.ErrNotExist) && err == nil
}

func hasArg(a string) bool {
	for _, x := range os.Args[1:] {
		if x == a {
			return true
		}
	}
	return false
}
