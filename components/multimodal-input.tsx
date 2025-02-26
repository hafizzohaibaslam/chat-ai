"use client";

import type {
  Attachment,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from "ai";
import cx from "classnames";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  memo,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
} from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import { sanitizeUIMessages } from "@/lib/utils";
import { ArrowUpIcon, PaperclipIcon, StopIcon } from "./icons";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { SuggestedActions } from "./suggested-actions";
import equal from "fast-deep-equal";
import { MessageSquareText, Globe } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { LegislationSearchDrawer } from "./MessageInput/LegislationSearchDrawer";
import { API } from "@/lib/axios";
import { useChatContext } from "@/context/chatContext";

// -------------------------------------
// AttachmentPreview Component
function AttachmentPreview({
  attachment,
  onRemove,
  isUploading,
}: {
  attachment: Attachment;
  onRemove?: () => void;
  isUploading?: boolean;
}) {
  return (
    <div className="relative inline-block">
      <div className="w-20 h-20 border rounded-md overflow-hidden">
        {attachment.contentType?.startsWith("image") ? (
          <img
            src={attachment.url}
            alt={attachment.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-100 text-xs text-gray-600">
            {attachment.name}
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xs">
            Uploading...
          </div>
        )}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
        >
          &times;
        </button>
      )}
    </div>
  );
}

// -------------------------------------
// Upload Button Component
function PureAttachmentsButton({
  fileInputRef,
  isLoading,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  isLoading: boolean;
}) {
  return (
    <Button
      className="rounded-md rounded-bl-lg p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
      onClick={(event) => {
        event?.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={isLoading}
      variant="ghost"
    >
      <PaperclipIcon size={14} />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

// -------------------------------------
// Main Multimodal Input Component
function PureMultimodalInput({
  chatId,
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
}: {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: { preventDefault?: () => void },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  const { addFileUploadResponse } = useChatContext();
  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${
        textareaRef.current.scrollHeight + 2
      }px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = "98px";
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    ""
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      const finalValue = domValue || localStorageInput || "";
      setInput(finalValue);
      adjustHeight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  // Create local preview so user sees the file name/image right away
  const createLocalPreview = async (file: File) => {
    return new Promise<Attachment>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          name: file.name,
          contentType: file.type,
        });
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
  };

  // Actually upload the file(s) to your backend
  async function uploadToServer(files: File[]) {
    const formData = new FormData();

    if (files.length === 1) {
      // Single file => POST /file/process_file
      formData.append("file", files[0]);
      const res = await API.post("file/process_file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      addFileUploadResponse([res.data]);
      return res.data;
    } else {
      // Multiple files => POST /file/process_files_batch
      // "files" array in form data
      files.forEach((file) => {
        formData.append("files", file);
      });
      // Optionally append "batch_size" if needed, e.g. formData.append("batch_size", "3");
      const res = await API.post("file/process_files_batch", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      addFileUploadResponse(Object.values(res.data));
      return res.data;
    }
  }

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      setUploadQueue(files.map((file) => file.name));

      console.log("handleFileChange -> selected files:", files);

      try {
        // Step 1: create local previews
        const previewPromises = files.map((file) => createLocalPreview(file));
        const localPreviews = await Promise.all(previewPromises);

        // Step 2: add local previews to attachments (UI)
        setAttachments((current) => [...current, ...localPreviews]);

        // Step 3: upload to server
        const responseData = await uploadToServer(files);
        console.log("Batch upload response:", responseData);

        if (files.length === 1) {
          toast.success(`File uploaded: ${files[0].name}`);
        } else {
          toast.success(`All ${files.length} files uploaded successfully!`);
        }
      } catch (error) {
        console.error("Error uploading files!", error);
        toast.error("Error uploading file(s)!");
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments]
  );

  const handleRemoveAttachment = (url: string) => {
    setAttachments((prev) => prev.filter((att) => att.url !== url));
  };

  const submitForm = useCallback(() => {
    window.history.replaceState({}, "", `/chat/${chatId}`);

    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    setAttachments([]);
    setLocalStorageInput("");
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  return (
    <div className="relative w-full flex flex-col gap-4">
      {/* If no messages, attachments, or queued uploads, show suggested actions */}
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <SuggestedActions append={append} chatId={chatId} />
        )}

      {/* Hidden file input for uploading */}
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {/* Show local previews or uploading placeholders */}
      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row gap-2 overflow-x-scroll items-end">
          {attachments.map((attachment) => (
            <div key={attachment.url} className="relative">
              <AttachmentPreview
                attachment={attachment}
                onRemove={() => handleRemoveAttachment(attachment.url)}
              />
            </div>
          ))}
          {uploadQueue.map((filename) => (
            <div key={filename} className="relative">
              <AttachmentPreview
                attachment={{
                  url: "",
                  name: filename,
                  contentType: "",
                }}
                isUploading={true}
              />
            </div>
          ))}
        </div>
      )}

      <Textarea
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className={cx(
          "min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700",
          className
        )}
        rows={2}
        autoFocus
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (isLoading) {
              toast.error("Please wait for the model to finish its response!");
            } else {
              submitForm();
            }
          }
        }}
      />

      <TooltipProvider>
        <div className="absolute bottom-0 p-2 w-fit flex flex-row justify-start items-center">
          {/* Upload Documents */}
          <Tooltip>
            <TooltipTrigger>
              <span className="inline-block">
                <AttachmentsButton
                  fileInputRef={fileInputRef}
                  isLoading={isLoading}
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload Documents</p>
            </TooltipContent>
          </Tooltip>

          {/* Prompt Templates */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-block">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-md rounded-bl-lg h-fit p-[7px] dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
                >
                  <MessageSquareText className="h-5 w-5" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Prompt Templates</p>
            </TooltipContent>
          </Tooltip>

          {/* Legislation Search Drawer */}
          <LegislationSearchDrawer />

          {/* Internet Search */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-block">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-md rounded-bl-lg h-fit p-[7px] dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
                >
                  <Globe className="h-5 w-5" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Internet Search</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Send / Stop buttons */}
      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
        {isLoading ? (
          <StopButton stop={stop} setMessages={setMessages} />
        ) : (
          <SendButton
            input={input}
            submitForm={submitForm}
            uploadQueue={uploadQueue}
          />
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;
    return true;
  }
);

// -------------------------------------
// StopButton Component
function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
  return (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event?.preventDefault();
        stop();
        setMessages((messages) => sanitizeUIMessages(messages));
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}
const StopButton = memo(PureStopButton);

// -------------------------------------
// SendButton Component
function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event?.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}
const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
