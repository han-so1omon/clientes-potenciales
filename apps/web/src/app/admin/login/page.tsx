import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto mt-24 max-w-sm rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold">Admin sign in</h1>
      <LoginForm />
    </div>
  );
}
