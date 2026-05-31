"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  initialIsFollowing: boolean;
  locale: string;
  username: string;
  labels: { follow: string; following: string };
};

export default function FollowButton({ initialIsFollowing, locale, username, labels }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [pending, setPending] = useState(false);

  async function toggleFollow() {
    if (pending) return;
    const next = !isFollowing;
    setIsFollowing(next); // optimistic
    setPending(true);

    try {
      const res = await fetch("/api/profile/follow", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, action: next ? "follow" : "unfollow" }),
        credentials: "same-origin",
      });

      const json = await res.json();
      if (!res.ok || json?.error) {
        // rollback
        setIsFollowing(!next);
        // minimal error feedback
        // eslint-disable-next-line no-console
        console.error("Follow API error", json?.error);
        alert(json?.error ?? "Failed to update follow status");
      }
    } catch (err) {
      setIsFollowing(!next);
      // eslint-disable-next-line no-console
      console.error(err);
      alert((err as Error).message || "Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button onClick={toggleFollow} variant={isFollowing ? "secondary" : "primary"} disabled={pending} title={isFollowing ? labels.following : labels.follow}>
      {isFollowing ? labels.following : labels.follow}
    </Button>
  );
}
