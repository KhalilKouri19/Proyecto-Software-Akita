import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">
        Bienvenido a Akita Reparaciones
      </h1>
      <p className="text-gray-700 mb-6">Tu sitio de confianza para reparación de electrodomésticos</p>

      {/* 🔹 Botón hacia el login */}
      <Link
        href="/login"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
      >
        Iniciar sesión
      </Link>
    </div>
  );
}
