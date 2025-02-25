"use client";

import { useState, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import cx from "classnames";

import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { Button } from "./ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

// Icons used below — replace or expand with your own if needed.
import {
  SparklesIcon,
  PencilEditIcon,
  CopyIcon,
  ThumbUpIcon,
  ThumbDownIcon,
} from "./icons";

/** Dummy interface for your message shape. Adjust as needed. */
interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  experimental_attachments?: Array<{
    url: string;
    name?: string;
    contentType?: string;
  }>;
}

/**
 * Renders a single message (assistant or user).
 * - Assistant: left-aligned, Sparkles icon, copy/like/dislike buttons
 * - User: right-aligned, edit mode (textarea) for content, no copy/like/dislike
 */
function PurePreviewMessage({
  message,
  isReadonly = false,
}: {
  message: Message;
  isReadonly?: boolean;
}) {
  // Local edit mode for user messages
  const [isEditMode, setIsEditMode] = useState(false);
  // Local buffer for edited text
  const [tempContent, setTempContent] = useState(message.content);

  // Save edited text locally (no API)
  const handleSave = () => {
    message.content = tempContent;
    setIsEditMode(false);
  };

  // Cancel edit, revert to original content
  const handleCancel = () => {
    setTempContent(message.content);
    setIsEditMode(false);
  };

  // Assistant on left, user on right
  const alignmentClasses =
    message.role === "assistant" ? "justify-start" : "justify-end";

  // Different bubble color for user vs. assistant
  const bubbleClasses =
    message.role === "assistant"
      ? "bg-background ring-1 ring-border"
      : "bg-primary text-primary-foreground";

  return (
    <AnimatePresence>
      <motion.div
        className={cx(
          "w-full mx-auto px-4 my-2 flex max-w-3xl",
          alignmentClasses
        )}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {/* Icon for assistant on the left */}
        {message.role === "assistant" && (
          <div className="size-8 flex items-center justify-center mr-2 shrink-0">
            <SparklesIcon size={14} />
          </div>
        )}

        <div className="flex flex-col gap-2 max-w-[75%]">
          {/* If there are attachments, display them above the message bubble */}
          {message.experimental_attachments &&
            message.experimental_attachments.length > 0 && (
              <div className="flex flex-row flex-wrap gap-2 mb-1">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

          {/* Main message bubble */}
          <div
            className={cx(
              "px-3 py-2 rounded-xl flex flex-col gap-2",
              bubbleClasses
            )}
          >
            {/* If user is editing, show a textarea */}
            {isEditMode ? (
              <textarea
                className="w-full p-2 rounded-md bg-muted"
                rows={3}
                value={tempContent}
                onChange={(e) => setTempContent(e.target.value)}
              />
            ) : (
              <Markdown>{message.content}</Markdown>
            )}
          </div>

          {/* USER MESSAGE ACTIONS */}
          {message.role === "user" && !isReadonly && (
            <div className="flex flex-row items-center gap-2">
              {isEditMode ? (
                <>
                  <Button variant="secondary" size="sm" onClick={handleSave}>
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="px-2 h-fit rounded-full text-muted-foreground"
                      onClick={() => setIsEditMode(true)}
                    >
                      {/* <PencilEditIcon /> */}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit message</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* ASSISTANT MESSAGE ACTIONS (copy, like, dislike) */}
          {message.role === "assistant" && (
            <div className="flex flex-row items-center gap-2">
              <MessageActions content={message.content} />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export const PreviewMessage = memo(PurePreviewMessage);

/**
 * A simple "thinking" message for an in-progress assistant response.
 * Aligned left with a Sparkles icon.
 */
export function ThinkingMessage() {
  return (
    <motion.div
      className="w-full mx-auto px-4 my-2 flex justify-start max-w-3xl"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.5 } }}
    >
      <div className="size-8 flex items-center justify-center mr-2 shrink-0">
        <SparklesIcon size={14} />
      </div>
      <div className="bg-background ring-1 ring-border px-3 py-2 rounded-xl text-muted-foreground">
        Thinking...
      </div>
    </motion.div>
  );
}

/**
 * Local, dummy "actions" bar for copying text, liking, or disliking a message.
 * No API calls; everything is local state or local clipboard.
 */
function MessageActions({ content }: { content: string }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    // Optionally show a toast or alert
  };

  const handleLike = () => {
    setVote((prev) => (prev === "up" ? null : "up"));
  };

  const handleDislike = () => {
    setVote((prev) => (prev === "down" ? null : "down"));
  };

  return (
    <div className="flex flex-row gap-1 items-center">
      {/* Copy Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="px-2 h-fit rounded-full text-muted-foreground"
            onClick={handleCopy}
          >
            <CopyIcon size={14} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy</TooltipContent>
      </Tooltip>

      {/* Like Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={vote === "up" ? "default" : "ghost"}
            className="px-2 h-fit rounded-full text-muted-foreground"
            onClick={handleLike}
          >
            <ThumbUpIcon size={14} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Like</TooltipContent>
      </Tooltip>

      {/* Dislike Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={vote === "down" ? "default" : "ghost"}
            className="px-2 h-fit rounded-full text-muted-foreground"
            onClick={handleDislike}
          >
            <ThumbDownIcon size={14} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Dislike</TooltipContent>
      </Tooltip>
    </div>
  );
}
