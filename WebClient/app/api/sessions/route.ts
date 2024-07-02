import { prisma } from "../../../prisma/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const token = uuidv4();

    //1 heure à partir de maintenant
    const expires_at = new Date(Date.now() + 60 * 60 * 1000);

    const session = await prisma.session.create({
      data: {
        token,
        created_at: new Date(),
        expires_at,
        status: 1,
      },
    });

    return new Response(JSON.stringify({ token }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Session creation failed" }), {
      status: 500,
    });
  }
}
