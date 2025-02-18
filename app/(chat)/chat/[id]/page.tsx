import { Chat } from "@/components/chat";
// import { DataStreamHandler } from "@/components/data-stream-handler";

// Dummy messages to simulate chat history
const dummyMessages = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! This is a dummy message from the assistant.",
  },
  {
    id: "2",
    role: "user",
    content: "Hi! This is a dummy message from the user.",
  },
];

export default function Page() {
  return (
    <>
      <Chat
        id="dummy-chat-id"
        initialMessages={dummyMessages}
        selectedChatModel="dummy-model" // Replace with your default or dummy model name
        isReadonly={false}
      />
      {/* <DataStreamHandler id="dummy-chat-id" /> */}
    </>
  );
}
