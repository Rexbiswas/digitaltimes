"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children, onOpenStory }) {
  const [toasts, setToasts] = useState([]);
  const storyCallbackRef = useRef(onOpenStory);

  storyCallbackRef.current = onOpenStory;

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      description = "",
      type = "info", // "breaking" | "history" | "clipping" | "notification" | "success" | "info"
      desk = "",
      time = "JUST NOW",
      story = null,
      duration = 6000,
      action = null,
      onAction = null,
    }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

      const newToast = {
        id,
        title,
        description,
        type,
        desk: desk || (story?.desk ? story.desk.toUpperCase() : "DISPATCH"),
        time,
        story,
        duration,
        action,
        onAction,
        createdAt: Date.now(),
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible
      return id;
    },
    []
  );

  // Convenient specialized helper methods
  toast.breaking = useCallback(
    (title, description, story, actionLabel = "READ STORY") => {
      return toast({
        title,
        description,
        type: "breaking",
        desk: story?.desk || "BREAKING WIRE",
        story,
        action: actionLabel,
        duration: 8000,
      });
    },
    [toast]
  );

  toast.history = useCallback(
    (story, customMsg = null) => {
      if (!story) return;
      const headline = story.headline || story.title || "Dispatch";
      return toast({
        title: "LOGGED TO READING HISTORY",
        description: `“${headline.slice(0, 65)}${headline.length > 65 ? "..." : ""}”`,
        type: "history",
        desk: story.desk || "ARCHIVE",
        story,
        duration: 4500,
        action: "CONTINUE READING",
      });
    },
    [toast]
  );

  toast.clipping = useCallback(
    (story, isSaved) => {
      if (!story) return;
      const headline = story.headline || story.title || "Dispatch";
      return toast({
        title: isSaved ? "CLIPPED TO YOUR SCRAPBOOK" : "REMOVED FROM CLIPPINGS",
        description: `“${headline.slice(0, 65)}${headline.length > 65 ? "..." : ""}”`,
        type: "clipping",
        desk: story.desk || "CLIPPINGS",
        story,
        duration: 4000,
      });
    },
    [toast]
  );

  toast.notification = useCallback(
    (notif, onOpen) => {
      return toast({
        title: notif.title,
        description: notif.message || notif.deck || "",
        type: notif.type === "breaking" ? "breaking" : "notification",
        desk: notif.desk || "NEWSROOM",
        time: notif.time || "JUST NOW",
        story: notif.story || (notif.articleId ? { id: notif.articleId, headline: notif.title } : null),
        action: "READ NOW",
        onAction: onOpen,
        duration: 7500,
      });
    },
    [toast]
  );

  toast.success = useCallback(
    (title, description) => {
      return toast({
        title,
        description,
        type: "success",
        duration: 4000,
      });
    },
    [toast]
  );

  toast.dismiss = dismiss;

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts, onOpenStory }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return safe fallback if used outside provider
    return {
      toast: () => {},
      dismiss: () => {},
      toasts: [],
    };
  }
  return context;
}
