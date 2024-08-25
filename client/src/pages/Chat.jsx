import {
  AttachFile as AttachFileIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { IconButton, Skeleton, Stack } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import FileMenu from "../components/dialogs/FileMenu";
import AppLayout from "../components/layout/AppLayout";
import { InputBox } from "../components/styles/StyledComponents";
import { grayColor, orange } from "../constants/color";
import { SampleMessages } from "../constants/sampleData";
import MessageComponent from "../components/shared/MessageComponent";
import { getSocket } from "../utils/socket";
import { NEW_MESSAGE } from "../constants/events";
import { useChatDetailsQuery, useGetMessagesQuery } from "../redux/api/api";
import { useErrors, useSocketEvents } from "../hooks/hook";

const Chat = ({ chatId, user }) => {
  const containerRef = useRef(null);

  const socket = getSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);

  const chatDetails = useChatDetailsQuery({ chatId, skip: !chatId });
  const oldMessagesChunk = useGetMessagesQuery({ chatId, page });

  const errors = [
    { isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
  ];

  console.log("oldMessagesChunk", oldMessagesChunk.data);

  const members = chatDetails?.data?.chat?.members;

  const submitHandler = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // emitting message to server
    socket.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage("");
  };
  const newMessagesHandler = useCallback((data) => {
    setMessages((prevMessages) => [...prevMessages, data.message]);
  }, []);

  const eventhandlers = { [NEW_MESSAGE]: newMessagesHandler };
  useSocketEvents(socket, eventhandlers);
  useErrors(errors);

  return chatDetails.isLoading ? (
    <Skeleton />
  ) : (
    <>
      <Stack
        ref={containerRef}
        boxSizing={"border-box"}
        padding={"1rem"}
        spacing={"1rem"}
        bgcolor={grayColor}
        height={"90%"}
        sx={{ overflowX: "hidden", overflowY: "auto" }}
      >
        {/* Message Render */}
        {!oldMessagesChunk.isLoading &&
          oldMessagesChunk.data?.messages?.map((i) => (
            <MessageComponent key={i._id} message={i} user={user} />
          ))}
        {messages.map((i) => (
          <MessageComponent key={i._id} message={i} user={user} />
        ))}
      </Stack>

      <form style={{ height: "10%" }} onSubmit={submitHandler}>
        <Stack
          direction={"row"}
          height={"100%"}
          padding={"1rem"}
          alignItems={"center"}
          position={"relative"}
        >
          <IconButton
            sx={{ position: "absolute", left: "1.5rem", rotate: "30deg" }}
          >
            <AttachFileIcon />
          </IconButton>
          <InputBox
            placeholder="Type message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <IconButton
            type="submit"
            sx={{
              rotate: "-30deg",
              bgcolor: orange,
              color: "white",
              marginLeft: "1rem",
              padding: "0.5rem",
              "&:hover": { bgcolor: "error.dark" },
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </form>
      <FileMenu />
    </>
  );
};

export default AppLayout()(Chat);
