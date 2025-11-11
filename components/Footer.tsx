import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp, FaTwitter, FaFacebookF, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#1b1b1b] text-white pt-10">
      {/* Secciones superiores */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-10 pb-10 text-center">
        {/* 🔹 PÁGINAS */}
        <div>
            <h3 className="font-semibold text-lg mb-4">PÁGINAS</h3>
            <ul className="space-y-1 text-sm text-gray-300">
            <li><Link href="/">Inicio</Link></li>
            <li><Link href="/canon">Canon</Link></li>
            <li><Link href="/consultas">Consultas</Link></li>
            <li><Link href="/servicio">Servicio Técnico</Link></li>
            <li><Link href="/contacto">Contacto</Link></li>
            <li><Link href="/seguimiento">Seguimiento de Reparaciones</Link></li>
            </ul>
        </div>
        
        {/* 🔹 Contacto */}
        <div>
            <h3 className="font-semibold text-lg mb-4">CONTACTO</h3>
            <ul className="space-y-1 text-sm text-gray-300">
            <li>WhatsApp</li>
            <li>Instagram</li>
            <li>Facebook</li>
            <li>X (Twitter)</li>
            <li>Mail</li>
            </ul>
        </div>

        {/* 🔹 Dirección */}
        <div>
            <h3 className="font-semibold text-lg mb-4">DIRECCIÓN</h3>
            <p className="text-sm text-gray-300">
            Emilio Mitre 914,<br />
            Parque Chacabuco,<br />
            CABA<br /><br />
            <strong>Horario:</strong><br />
            Lunes a Viernes<br />
            9 - 18 hs
            </p>
        </div>

        {/* 🔹 Marcas */}
        <div>
            <h3 className="font-semibold text-lg mb-4">MARCAS</h3>
            <ul className="space-y-1 text-sm text-gray-300">
            <li>Canon</li>
            <li>LG</li>
            <li>Brother</li>
            <li>Hanwha</li>
            <li>Newsan</li>
            </ul>
        </div>
        </div>


        {/* Sección inferior */}
        <div className="bg-[#222] flex flex-col sm:flex-row items-center justify-between px-10 py-6">
        <div className="flex items-center gap-3">
            <Image
            src="/logo.png"
            alt="Akita Electrónica"
            width={50}
            height={50}
            className="rounded-full"
            />
        </div>

        {/* 🔹 Copyright centrado */}
        <div className="flex-1 text-center text-sm text-gray-400">
            © Akita Electrónica 2025
        </div>

        <div className="flex gap-4 text-lg text-gray-300">
            <Link href="#"><FaWhatsapp /></Link>
            <Link href="#"><FaTwitter /></Link>
            <Link href="#"><FaFacebookF /></Link>
            <Link href="#"><FaInstagram /></Link>
        </div>
        </div>


    </footer>
  );
}
