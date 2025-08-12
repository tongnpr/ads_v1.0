import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect users from the root URL ("/") to your main page ("/overview")
  redirect("/overview");
}