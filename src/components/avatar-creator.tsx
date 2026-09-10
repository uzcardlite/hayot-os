"use client";

import { useEffect, useRef } from "react";

type RpmMessage = {
  source?: string;
  eventName?: string;
  data?: { url?: string };
};

export function AvatarCreator({ onComplete }: { onComplete: (url: string) => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      let json: RpmMessage | null;
      try {
        json = JSON.parse(event.data);
      } catch {
        return;
      }
      if (json?.source !== "readyplayerme") return;

      if (json.eventName === "v1.frame.ready") {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            target: "readyplayerme",
            type: "subscribe",
            eventName: "v1.**",
          }),
          "*"
        );
      }

      if (json.eventName === "v1.avatar.exported" && json.data?.url) {
        onComplete(json.data.url);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onComplete]);

  return (
    <iframe
      ref={iframeRef}
      src="https://demo.readyplayer.me/avatar?frameApi&bodyType=fullbody"
      className="h-full w-full rounded-2xl border border-[#332a1f]"
      allow="camera *; microphone *"
      title="3D avatar yaratish"
    />
  );
}
