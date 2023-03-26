import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="relative col-span-full flex flex-col md:col-span-4">
        {children}
        <Footer />
      </main>
    </>
  );
}
