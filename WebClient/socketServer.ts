import { Server, Socket } from "socket.io";
import { cookies } from "next/headers";
const cookieStore = cookies();

function generateRandomNumber(): number {
  let randomNumber: number;
  do {
    randomNumber = Math.floor(Math.random() * 9000) + 1000;
  } while (randomNumber === 3000);

  return randomNumber;
}
const port = generateRandomNumber();
cookieStore.set("port", port.toString(), {
  maxAge: 60 * 60 * 24,
  path: "/",
});

const io = new Server(port, {
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
