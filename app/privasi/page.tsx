import type { Metadata } from "next";
import { ContentPage, LegalArticle } from "../_components/site-shell";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Ruang Momen",
  description: "Transparansi tentang bagaimana data dan momenmu dikelola oleh Ruang Momen.",
};

export default function PrivasiPage() {
  return (
    <ContentPage eyebrow="Legal & Privasi" title="Kebijakan Privasi" description="Transparansi tentang bagaimana data dan momenmu kami kelola.">
      <LegalArticle>
        <section><h2>1. Informasi yang Kami Kumpulkan</h2><p>Ketika layanan tersedia sepenuhnya, Ruang Momen dapat memproses informasi yang diperlukan untuk menyediakan pengalaman album acara, termasuk:</p><ul><li>Nama pengguna, alamat email, dan informasi akun.</li><li>Informasi acara yang dibuat atau diikuti.</li><li>Foto dan media yang diunggah ke dalam album.</li><li>Informasi teknis dasar, seperti jenis browser dan perangkat.</li><li>Informasi mengenai penggunaan layanan.</li></ul></section>
        <section><h2>2. Bagaimana Data Digunakan</h2><p>Data dapat digunakan untuk menyediakan layanan Ruang Momen, mengelola album dan acara, mendukung autentikasi pengguna, menjaga keamanan layanan, meningkatkan pengalaman pengguna, serta memberikan bantuan ketika diperlukan.</p></section>
        <section><h2>3. Foto dan Konten Pengguna</h2><p>Kepemilikan foto dan konten tetap berada pada pengguna atau pemilik konten. Ruang Momen hanya memproses dan menyimpan konten sejauh diperlukan untuk menyediakan layanan. Pengguna bertanggung jawab atas konten yang mereka unggah dan bagikan.</p></section>
        <section><h2>4. Penyimpanan Data</h2><p>Data dapat disimpan selama diperlukan untuk memberikan layanan atau selama acara maupun akun masih aktif. Jangka waktu dapat disesuaikan berdasarkan kebutuhan operasional dan ketentuan yang berlaku.</p></section>
        <section><h2>5. Keamanan</h2><p>Ruang Momen berupaya menerapkan praktik keamanan yang wajar untuk membantu melindungi data pengguna. Namun, tidak ada metode penyimpanan atau transmisi digital yang sepenuhnya bebas risiko.</p></section>
        <section><h2>6. Pihak Ketiga</h2><p>Dalam pengembangannya, Ruang Momen mungkin menggunakan layanan pihak ketiga untuk penyimpanan data, autentikasi, pembayaran, analitik, atau komunikasi. Informasi mengenai penyedia yang digunakan dapat diperbarui ketika layanan tersebut diterapkan.</p></section>
        <section><h2>7. Penghapusan Data</h2><p>Pengguna nantinya dapat mengajukan penghapusan akun, acara, atau data tertentu melalui kanal kontak resmi Ruang Momen. Permintaan akan ditangani sesuai kemampuan layanan dan kewajiban yang berlaku.</p></section>
        <section><h2>8. Perubahan Kebijakan</h2><p>Kebijakan ini dapat diperbarui seiring pengembangan layanan, perubahan operasional, atau kebutuhan hukum. Versi terbaru akan ditampilkan pada halaman ini.</p></section>
        <section><h2>9. Kontak Privasi</h2><p>Untuk pertanyaan mengenai privasi, hubungi <a className="text-[#D6B56F] underline decoration-[#D6B56F]/35 underline-offset-4" href="mailto:privasi@ruangmomen.test">privasi@ruangmomen.test</a>.</p>{/* TODO: Replace placeholder privacy email before production */}</section>
      </LegalArticle>
    </ContentPage>
  );
}
