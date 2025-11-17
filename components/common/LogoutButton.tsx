"use client";

import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  className?: string;
  label?: string;
}

export default function LogoutButton({
  className,
  label = "Cerrar sesión",
}: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    // 💣 borrar la “sesión” que guardamos
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className={
        className ??
        "bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition"
      }
    >
      {label}
    </button>
  );
}
