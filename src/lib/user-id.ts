import { jwtVerify } from "jose/jwt/verify";
import { NextRequest } from "next/server";


export default async function getUserIdfromToken(request: NextRequest): Promise<string | undefined> {
    try {
        const token = request.cookies.get("token")?.value;
        console.log("Token from cookies:", token);
        if (!token) {
            return undefined;
        }

        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET!)
        );
        console.log("user id", payload.sub);

        return payload.sub as string ;
    } catch (err) {
        return `something went wrong: ${err}`;
    }

}