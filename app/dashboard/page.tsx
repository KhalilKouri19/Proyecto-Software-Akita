import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Bienvenido, {session.user?.name} ({session.user?.role})
      </h1>
    </div>
  );
}
