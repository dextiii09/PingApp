import { auth } from "@clerk/nextjs/server";

export default async function Page() {
    const { userId } = await auth();

    return (
        <main>
            <h1>Protected Page</h1>
            <p>Your user ID is: {userId}</p>
        </main>
    );
}
