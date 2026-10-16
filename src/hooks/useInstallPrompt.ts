import { useEffect, useState } from "react";

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandalone());
  const [ios] = useState(() => isIos());
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setHelpOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (installed) return;

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choice.outcome === "accepted") setInstalled(true);
      return;
    }

    setHelpOpen(true);
  }

  return {
    installed,
    ios,
    helpOpen,
    canPrompt: Boolean(deferredPrompt),
    install,
    dismissHelp: () => setHelpOpen(false),
  };
}
