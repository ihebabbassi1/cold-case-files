import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Request a Badge — Cold Case Files" };

export default function RegisterPage() {
  return (
    <div className="container flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-16">
      <AuthForm mode="register" />
    </div>
  );
}
