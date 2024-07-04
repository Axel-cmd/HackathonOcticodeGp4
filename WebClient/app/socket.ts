import { io } from "socket.io-client";
import { cookies } from "next/headers";

const cookieStore = cookies();
const port = cookieStore.get("port");
const socket = io(`${process.env.BASE_URL}:${port}`);

export default socket;
