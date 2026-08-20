import type { Metadata } from "next";
import { ContentPage, LegalArticle } from "../_components/site-shell";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan | Ruang Momen",
  description: "Ketentuan penggunaan layanan Ruang Momen untuk ruang berbagi cerita yang aman.",
};

export default function SyaratPage() {
  return (
    <ContentPage eyebrow="Ketentuan Layanan" title="Syarat & Ketentuan" description="Ketentuan sederhana agar Ruang Momen tetap menjadi ruang yang aman untuk berbagi cerita.">
      <LegalArticle>
        <section><h2>1. Penggunaan Layanan</h2><p>Ruang Momen ditujukan untuk membuat dan mengelola album bersama bagi acara yang sah. Pengguna diharapkan memakai layanan secara bertanggung jawab dan sesuai ketentuan yang berlaku.</p></section>
        <section><h2>2. Akun Pengguna</h2><p>Ketika fitur akun tersedia, pengguna bertanggung jawab menjaga kebenaran informasi akun dan keamanan akses miliknya. Aktivitas melalui akun dianggap dilakukan oleh pemilik akun tersebut.</p></section>
        <section><h2>3. Pembuatan Acara</h2><p>Host bertanggung jawab atas informasi acara, pengaturan album, dan pihak yang menerima akses. Ruang Momen dapat menetapkan batas penggunaan yang wajar ketika layanan diluncurkan.</p></section>
        <section><h2>4. Konten dan Foto Pengguna</h2><p>Hak atas foto dan konten tetap dimiliki pengguna atau pemiliknya. Dengan mengunggah konten, pengguna mengizinkan Ruang Momen memprosesnya sebatas yang diperlukan untuk menjalankan layanan.</p></section>
        <section><h2>5. Konten yang Dilarang</h2><p>Pengguna tidak boleh mengunggah konten yang melanggar hukum, hak orang lain, privasi, atau mengandung materi berbahaya, menipu, diskriminatif, maupun eksploitasi.</p></section>
        <section><h2>6. Hak Kekayaan Intelektual</h2><p>Brand, desain, dan elemen layanan Ruang Momen dilindungi sesuai ketentuan yang berlaku. Pengguna tidak memperoleh hak untuk menyalin atau menggunakan elemen tersebut di luar penggunaan layanan yang wajar.</p></section>
        <section><h2>7. Penyimpanan dan Penghapusan Konten</h2><p>Konten dapat disimpan selama dibutuhkan untuk menyediakan layanan. Pengguna nantinya dapat meminta penghapusan konten tertentu, dengan mempertimbangkan proses teknis dan kewajiban yang berlaku.</p></section>
        <section><h2>8. Paket dan Pembayaran</h2><p>Apabila paket berbayar tersedia, harga, manfaat, batas penggunaan, dan metode pembayaran akan mengikuti informasi paket yang berlaku ketika layanan diluncurkan.</p></section>
        <section><h2>9. Pembatalan dan Refund</h2><p>Ketentuan pembatalan dan pengembalian dana belum bersifat final. Detailnya akan mengikuti informasi paket dan kebijakan yang berlaku pada saat transaksi dilakukan.</p></section>
        <section><h2>10. Batasan Layanan</h2><p>Layanan dapat mengalami perubahan, pemeliharaan, atau gangguan. Ruang Momen tidak menjanjikan bahwa seluruh fungsi akan selalu tersedia tanpa jeda atau kesalahan.</p></section>
        <section><h2>11. Penangguhan Akun</h2><p>Ruang Momen dapat membatasi atau menangguhkan akses yang melanggar ketentuan, membahayakan pengguna lain, atau mengganggu keamanan dan operasional layanan.</p></section>
        <section><h2>12. Perubahan Ketentuan</h2><p>Ketentuan ini dapat diperbarui seiring pengembangan produk dan kebutuhan operasional. Versi terbaru akan tersedia pada halaman ini.</p></section>
        <section><h2>13. Kontak</h2><p>Pertanyaan mengenai ketentuan dapat dikirim ke <a className="text-[#D6B56F] underline decoration-[#D6B56F]/35 underline-offset-4" href="mailto:legal@ruangmomen.test">legal@ruangmomen.test</a>.</p>{/* TODO: Replace placeholder legal email before production */}</section>
      </LegalArticle>
    </ContentPage>
  );
}
