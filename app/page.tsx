import { redirect } from "next/navigation";

export default function HomePage() {
  // เมื่อมีคนเข้ามาที่หน้าแรก ให้ส่งไปที่ /overview ทันที
  redirect("/overview");
}