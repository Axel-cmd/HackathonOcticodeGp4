import { Server, Socket } from "socket.io";

const io = new Server(3001, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket: Socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // socket.on("redirect", (data) => {
  //   console.log(`Redirect data received: ${data}`);
  //   socket.disconnect();
  // });
});

export default io;
