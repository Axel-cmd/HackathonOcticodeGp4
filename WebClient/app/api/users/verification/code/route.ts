import { prisma } from "../../../../../prisma/db";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    if (user.code === code) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid code" }),
        {
          status: 401,
        }
      );
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Verification failed" }), {
      status: 500,
    });
  }
}
