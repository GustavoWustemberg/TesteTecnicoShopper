import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import Image from "next/image"; // Importe o componente Image

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Desafio Shopper"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header className="header">
          <nav>
            <ul>
              <li>
                <Link href="/">Login</Link>
              </li>
              <li>
                <Link href="/register">Criar conta</Link>
              </li>
            </ul>
          </nav>
        </header>
        {children}
        <footer className="footer">
          <a
            href="https://github.com/GustavoWustemberg"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {/* Substituindo <img> por <Image /> */}
            <Image
              src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg"
              alt="Link para perfil do github"
              title="Link para perfil do github"
              width={24} // Ajuste o tamanho conforme necessário
              height={24} // Ajuste o tamanho conforme necessário
            />
            <p>
              Create by Gustavo Wustemberg ©
            </p>
          </a>
        </footer>
      </body>
    </html>
  );
}
