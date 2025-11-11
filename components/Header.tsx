import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp, FaTwitter, FaFacebookF, FaInstagram } from "react-icons/fa";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#2CA3E0] text-white shadow-md z-20">
      <div className="w-full flex items-center justify-between px-24 py-3">
        {/* 🔹 Logo mucho más separado del borde */}
        <div className="flex items-center ml-10">
          <Image
            src="/logo.png"
            alt="Logo Akita"
            width={65}
            height={65}
            className="rounded-full border-2 border-white shadow-sm"
          />
        </div>

        {/* 🔹 Menú centrado */}
        <nav className="flex-1 flex justify-center gap-10 font-medium text-sm tracking-wide">
          <Link href="/" className="hover:text-gray-200 transition">
            INICIO
          </Link>
          <Link href="/canon" className="hover:text-gray-200 transition">
            CANON
          </Link>
          <Link href="/servicio" className="hover:text-gray-200 transition">
            SERVICIO TÉCNICO
          </Link>
          <Link href="/contacto" className="hover:text-gray-200 transition">
            CONTACTO
          </Link>
          <Link href="/seguimiento" className="hover:text-gray-200 transition">
            SEGUIMIENTO DE REPARACIONES
          </Link>
        </nav>

        {/* 🔹 Redes mucho más hacia la derecha */}
        <div className="flex gap-5 text-xl mr-10">
          <Link href="#" className="hover:text-gray-200">
            <FaWhatsapp />
          </Link>
          <Link href="#" className="hover:text-gray-200">
            <FaFacebookF />
          </Link>
          <Link href="#" className="hover:text-gray-200">
            <FaInstagram />
          </Link>
        </div>
      </div>
    </header>
  );
}
