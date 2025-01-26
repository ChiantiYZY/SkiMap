import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  redirect("/app");
  // if (!session?.user) {
  //   redirect("/login");
  // }

  return children;
} 