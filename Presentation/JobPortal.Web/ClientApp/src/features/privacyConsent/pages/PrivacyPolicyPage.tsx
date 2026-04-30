import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, CheckCircle2, ArrowLeft, Building2, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { useBranding } from '../../../contexts/BrandingContext';
import { useRecordConsentMutation } from '../api/privacyConsentApi';
import { cn } from '../../../lib/utils';
const LAST_UPDATED = 'April 27, 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="text-sm text-gray-700 leading-relaxed flex flex-col gap-2">{children}</div>
    </section>
  );
}

function Article({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-semibold text-gray-800">Pasal {number} – {title}</p>
      <div className="text-sm text-gray-700 leading-relaxed flex flex-col gap-1">{children}</div>
    </div>
  );
}

export function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { companyName: COMPANY_NAME, logoUrl, address, contactEmail, contactPhone } = useBranding();
  const [recordConsent, { isLoading: consenting }] = useRecordConsentMutation();
  const [agreed, setAgreed] = useState(false);

  const redirectTo = searchParams.get('redirect');
  const isConsentFlow = !!redirectTo && isAuthenticated;

  const handleAgree = async () => {
    try {
      await recordConsent().unwrap();
      setAgreed(true);
      setTimeout(() => navigate(redirectTo!), 600);
    } catch {
      setAgreed(true);
      setTimeout(() => navigate(redirectTo!), 600);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden${!logoUrl ? ' bg-[var(--primary)]' : ''}`}>
            {logoUrl
              ? <img src={logoUrl} alt={COMPANY_NAME} className="h-7 w-7 object-contain" />
              : <Building2 className="h-4 w-4 text-white" />
            }
          </div>
          <span className="text-sm font-bold text-gray-900 flex-1">{COMPANY_NAME}</span>
          {!isConsentFlow && (
            <Link to="/careers" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
        {/* Title */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[var(--primary)]" />
            <h1 className="text-2xl font-bold text-gray-900">Privacy Policy & Personal Data Protection</h1>
          </div>
          <p className="text-sm text-gray-500">
            In accordance with Law No. 27 of 2022 on Personal Data Protection (UU PDP) · Effective {LAST_UPDATED}
          </p>
        </div>

        {isConsentFlow && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Please read and accept this privacy policy before proceeding with your job application.
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 flex flex-col gap-8">

          {/* Pendahuluan */}
          <Section title="Pendahuluan">
            <p>
              {COMPANY_NAME} ("Perusahaan", "kami") berkomitmen untuk melindungi dan menghormati privasi Anda
              sesuai dengan Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) dan
              peraturan pelaksanaannya.
            </p>
            <p>
              Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan
              melindungi data pribadi Anda saat menggunakan platform rekrutmen kami.
            </p>
          </Section>

          <hr className="border-gray-100" />

          {/* Definisi */}
          <Section title="Bab I – Definisi (Pasal 1 UU PDP)">
            <p>Dalam kebijakan ini, istilah berikut memiliki pengertian sebagaimana dimaksud dalam UU PDP:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><span className="font-medium">Data Pribadi</span> — segala informasi tentang orang perseorangan yang teridentifikasi atau dapat diidentifikasi secara tersendiri maupun dikombinasi.</li>
              <li><span className="font-medium">Data Pribadi yang Bersifat Spesifik</span> — data kesehatan, biometrik, genetika, pandangan politik, keyakinan agama, catatan kejahatan, dan data anak.</li>
              <li><span className="font-medium">Subjek Data Pribadi</span> — Anda sebagai orang perseorangan yang data pribadinya diproses.</li>
              <li><span className="font-medium">Pengendali Data Pribadi</span> — {COMPANY_NAME} yang menentukan tujuan dan melakukan kendali pemrosesan data pribadi.</li>
              <li><span className="font-medium">Prosesor Data Pribadi</span> — pihak yang memproses data pribadi atas nama Pengendali.</li>
              <li><span className="font-medium">Pemrosesan Data Pribadi</span> — segala kegiatan terhadap data pribadi termasuk pengumpulan, penyimpanan, penggunaan, pengungkapan, dan penghapusan.</li>
            </ul>
          </Section>

          <hr className="border-gray-100" />

          {/* Data yang dikumpulkan */}
          <Section title="Bab II – Data Pribadi yang Kami Kumpulkan">
            <Article number="1" title="Jenis Data">
              <p>Kami mengumpulkan jenis data pribadi berikut:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><span className="font-medium">Data identitas</span> — nama lengkap, alamat surel (email), nomor telepon.</li>
                <li><span className="font-medium">Data profil profesional</span> — riwayat pendidikan (termasuk jurusan dan jenjang), riwayat pekerjaan, keahlian.</li>
                <li><span className="font-medium">Dokumen lamaran</span> — Curriculum Vitae (CV), sertifikat, dan dokumen pendukung lainnya yang Anda unggah.</li>
                <li><span className="font-medium">Data aktivitas lamaran</span> — posisi yang dilamar, status lamaran, catatan hasil seleksi.</li>
                <li><span className="font-medium">Data teknis</span> — log akses, alamat IP, informasi perangkat, dan data sesi untuk keamanan sistem.</li>
              </ul>
            </Article>
            <Article number="2" title="Cara Pengumpulan">
              <p>Data dikumpulkan melalui:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Formulir pendaftaran dan profil yang Anda isi secara langsung.</li>
                <li>Proses otentikasi melalui layanan identitas pihak ketiga yang terintegrasi.</li>
                <li>Dokumen yang Anda unggah dalam proses lamaran kerja.</li>
              </ul>
            </Article>
          </Section>

          <hr className="border-gray-100" />

          {/* Tujuan pemrosesan */}
          <Section title="Bab III – Tujuan dan Dasar Hukum Pemrosesan (Pasal 20 UU PDP)">
            <p>Kami memproses data pribadi Anda berdasarkan dasar hukum yang sah sebagaimana diatur dalam Pasal 20 UU PDP, dengan tujuan sebagai berikut:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200">Tujuan Pemrosesan</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200">Dasar Hukum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="px-3 py-2">Manajemen proses rekrutmen dan seleksi</td><td className="px-3 py-2">Persetujuan (Pasal 20 huruf a)</td></tr>
                  <tr><td className="px-3 py-2">Komunikasi terkait status lamaran</td><td className="px-3 py-2">Kepentingan kontraktual (Pasal 20 huruf b)</td></tr>
                  <tr><td className="px-3 py-2">Kepatuhan hukum ketenagakerjaan</td><td className="px-3 py-2">Kewajiban hukum (Pasal 20 huruf c)</td></tr>
                  <tr><td className="px-3 py-2">Keamanan dan integritas sistem</td><td className="px-3 py-2">Kepentingan yang sah (Pasal 20 huruf f)</td></tr>
                  <tr><td className="px-3 py-2">Analitik agregat untuk perencanaan SDM</td><td className="px-3 py-2">Kepentingan yang sah (Pasal 20 huruf f)</td></tr>
                </tbody>
              </table>
            </div>
          </Section>

          <hr className="border-gray-100" />

          {/* Hak Subjek Data */}
          <Section title="Bab IV – Hak Anda sebagai Subjek Data Pribadi (Pasal 5–15 UU PDP)">
            <p>UU PDP memberikan hak-hak berikut kepada Anda yang dapat Anda exerciskan kapan saja:</p>

            <Article number="5" title="Hak atas Informasi">
              <p>Anda berhak memperoleh informasi mengenai identitas Pengendali, tujuan pemrosesan, jenis data yang dikumpulkan, dan jangka waktu penyimpanan sebelum data Anda diproses.</p>
            </Article>

            <Article number="6" title="Hak Akses">
              <p>Anda berhak memperoleh salinan data pribadi Anda yang kami simpan, termasuk informasi mengenai siapa yang memiliki akses dan untuk tujuan apa data tersebut digunakan.</p>
            </Article>

            <Article number="7" title="Hak Koreksi">
              <p>Anda berhak meminta perbaikan atau pemutakhiran data pribadi yang tidak akurat, tidak lengkap, atau menyesatkan melalui menu Profil Saya di platform kami.</p>
            </Article>

            <Article number="8" title="Hak Penghapusan (Right to be Forgotten)">
              <p>Anda berhak meminta penghapusan data pribadi Anda apabila:</p>
              <ul className="list-disc list-inside pl-2 space-y-0.5">
                <li>Data tidak lagi diperlukan untuk tujuan semula.</li>
                <li>Anda menarik persetujuan dan tidak ada dasar hukum lain.</li>
                <li>Data diproses secara tidak sah.</li>
              </ul>
              <p>Permintaan penghapusan dapat diajukan melalui tombol "Request Data Deletion" di halaman My Profile atau menghubungi kontak di bawah.</p>
            </Article>

            <Article number="9" title="Hak Penarikan Persetujuan">
              <p>Anda dapat menarik persetujuan pemrosesan data yang didasarkan pada persetujuan kapan saja tanpa mempengaruhi keabsahan pemrosesan yang telah dilakukan sebelum penarikan.</p>
            </Article>

            <Article number="10" title="Hak Portabilitas Data">
              <p>Anda berhak menerima data pribadi Anda dalam format yang terstruktur, umum digunakan, dan dapat dibaca mesin, serta berhak mengirimkan data tersebut ke Pengendali lain.</p>
            </Article>

            <Article number="11" title="Hak Keberatan">
              <p>Anda berhak mengajukan keberatan terhadap pemrosesan data pribadi Anda, khususnya pemrosesan yang didasarkan pada kepentingan yang sah, termasuk pembuatan profil.</p>
            </Article>

            <Article number="12" title="Hak Penundaan Pemrosesan">
              <p>Anda berhak meminta penundaan pemrosesan data dalam kondisi tertentu, seperti saat ketepatan data sedang diverifikasi atau sedang ada sengketa hukum.</p>
            </Article>

            <Article number="13" title="Hak Tidak Menjadi Objek Keputusan Otomatis">
              <p>Anda berhak untuk tidak menjadi subjek keputusan yang semata-mata didasarkan pada pemrosesan otomatis, termasuk pembuatan profil, yang menghasilkan akibat hukum atau dampak signifikan pada Anda.</p>
            </Article>

            <Article number="14-15" title="Hak Ganti Rugi">
              <p>Apabila terjadi pelanggaran dalam pemrosesan data pribadi Anda yang menyebabkan kerugian, Anda berhak mengajukan gugatan perdata dan tuntutan ganti rugi sesuai ketentuan Pasal 14 dan 15 UU PDP.</p>
            </Article>
          </Section>

          <hr className="border-gray-100" />

          {/* Kewajiban Pengendali */}
          <Section title="Bab V – Kewajiban Kami sebagai Pengendali Data (Pasal 16–27 UU PDP)">
            <Article number="16" title="Prinsip Pemrosesan yang Sah">
              <p>Kami memroses data pribadi Anda berdasarkan prinsip:</p>
              <ul className="list-disc list-inside pl-2 space-y-0.5">
                <li><span className="font-medium">Legalitas</span> — hanya berdasarkan dasar hukum yang sah.</li>
                <li><span className="font-medium">Pembatasan tujuan</span> — hanya untuk tujuan yang telah ditetapkan dan dikomunikasikan.</li>
                <li><span className="font-medium">Minimalisasi data</span> — hanya mengumpulkan data yang diperlukan.</li>
                <li><span className="font-medium">Akurasi</span> — menjaga keakuratan dan kemutakhiran data.</li>
                <li><span className="font-medium">Pembatasan penyimpanan</span> — menyimpan data hanya selama diperlukan.</li>
                <li><span className="font-medium">Integritas dan kerahasiaan</span> — melindungi data dari akses tidak sah, pengungkapan, dan kehilangan.</li>
              </ul>
            </Article>

            <Article number="17" title="Kewajiban Pemberitahuan dan Transparansi">
              <p>Kami berkewajiban memberitahu Anda secara proaktif mengenai tujuan pemrosesan, dasar hukum, jenis data, dan hak-hak Anda sebelum atau pada saat pengumpulan data.</p>
            </Article>

            <Article number="26" title="Persetujuan yang Sah">
              <p>Persetujuan yang kami minta memenuhi syarat keabsahan UU PDP, yaitu: diberikan secara bebas, spesifik, terinformasi, dan tidak ambigu. Anda dapat menarik persetujuan kapan saja.</p>
            </Article>
          </Section>

          <hr className="border-gray-100" />

          {/* Penyimpanan dan Retensi */}
          <Section title="Bab VI – Penyimpanan dan Retensi Data">
            <p>
              Data pribadi Anda disimpan di server yang berlokasi di wilayah Indonesia dengan langkah keamanan
              teknis dan organisasional yang memadai. Kami menyimpan data Anda selama:
            </p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>Data profil dan lamaran aktif: selama akun Anda aktif.</li>
              <li>Data lamaran yang ditolak: maksimal 2 (dua) tahun untuk keperluan kepatuhan hukum dan referensi rekrutmen.</li>
              <li>Log sistem dan audit: maksimal 1 (satu) tahun.</li>
              <li>Setelah periode retensi berakhir, data akan dihapus atau dianonimkan secara aman.</li>
            </ul>
          </Section>

          <hr className="border-gray-100" />

          {/* Keamanan */}
          <Section title="Bab VII – Keamanan Data Pribadi">
            <p>Kami menerapkan langkah-langkah keamanan teknis dan organisasional sebagaimana dipersyaratkan UU PDP, antara lain:</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>Enkripsi data saat transit (TLS/HTTPS) dan saat penyimpanan.</li>
              <li>Kontrol akses berbasis peran — hanya personel berwenang yang dapat mengakses data.</li>
              <li>Penyimpanan berkas dengan kunci unik yang tidak dapat ditebak (UUID), terpisah dari identitas pengguna.</li>
              <li>Audit log untuk setiap akses dan perubahan data sensitif.</li>
              <li>Pemantauan keamanan dan penilaian risiko berkala.</li>
            </ul>
            <p>
              Apabila terjadi pelanggaran keamanan yang berpotensi merugikan Anda, kami akan memberitahu Anda dan
              otoritas yang berwenang dalam jangka waktu yang dipersyaratkan peraturan yang berlaku.
            </p>
          </Section>

          <hr className="border-gray-100" />

          {/* Berbagi data */}
          <Section title="Bab VIII – Pengungkapan kepada Pihak Ketiga">
            <p>Kami tidak menjual atau menyewakan data pribadi Anda. Kami dapat berbagi data hanya dalam kondisi berikut:</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li><span className="font-medium">Internal</span> — tim HR dan manajer terkait dalam proses rekrutmen yang sama.</li>
              <li><span className="font-medium">Penyedia layanan</span> — mitra teknis yang membantu operasional platform (hosting, email, keamanan) berdasarkan perjanjian pemrosesan data yang memadai.</li>
              <li><span className="font-medium">Kewajiban hukum</span> — pengungkapan kepada otoritas pemerintah yang berwenang berdasarkan perintah hukum yang sah.</li>
            </ul>
            <p>Setiap pihak ketiga yang menerima data Anda terikat oleh kewajiban kerahasiaan dan perlindungan data yang setara atau lebih ketat.</p>
          </Section>

          <hr className="border-gray-100" />

          {/* Cookie */}
          <Section title="Bab IX – Cookie dan Teknologi Pelacakan">
            <p>
              Platform kami menggunakan cookie sesi yang diperlukan untuk fungsi autentikasi dan keamanan. Kami tidak
              menggunakan cookie pelacakan pihak ketiga untuk keperluan iklan. Cookie sesi dihapus secara otomatis
              saat Anda menutup browser.
            </p>
          </Section>

          <hr className="border-gray-100" />

          {/* Perubahan kebijakan */}
          <Section title="Bab X – Perubahan Kebijakan Privasi">
            <p>
              Kami dapat memperbarui kebijakan ini sewaktu-waktu untuk mencerminkan perubahan praktik, teknologi,
              atau regulasi. Perubahan material akan diberitahukan melalui surel atau notifikasi dalam platform
              setidaknya 30 (tiga puluh) hari sebelum berlaku efektif. Penggunaan platform setelah tanggal
              berlaku perubahan merupakan penerimaan atas kebijakan yang diperbarui.
            </p>
          </Section>

          <hr className="border-gray-100" />

          {/* Kontak */}
          <Section title="Bab XI – Kontak Pelindungan Data Pribadi">
            <p>Untuk mengexerciskan hak-hak Anda atau jika Anda memiliki pertanyaan atau keberatan terkait pemrosesan data pribadi, silakan hubungi:</p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm flex flex-col gap-1">
              <p className="font-semibold text-gray-900">{COMPANY_NAME} — Personal Data Protection Team</p>
              {address && <p className="text-gray-600">Address: {address}</p>}
              <p className="text-gray-600">Email: <a href={`mailto:${contactEmail}`} className="text-[var(--primary)] hover:underline">{contactEmail}</a></p>
              {contactPhone && <p className="text-gray-600">Phone: {contactPhone}</p>}
              <p className="text-gray-500 mt-1">Response will be provided within 14 (empat belas) working days as required by UU PDP.</p>
            </div>
            <p>
              Apabila Anda merasa hak Anda tidak dipenuhi, Anda berhak mengajukan pengaduan kepada lembaga pengawas
              yang berwenang sebagaimana diatur dalam UU PDP.
            </p>
          </Section>

          <hr className="border-gray-100" />

          {/* Sanksi */}
          <Section title="Bab XII – Dasar Sanksi (Pasal 65–67 UU PDP)">
            <p>
              Kami memahami bahwa pelanggaran terhadap ketentuan UU PDP dapat dikenai sanksi pidana maupun administratif.
              Oleh karena itu, kami berkomitmen penuh untuk mematuhi seluruh ketentuan dalam UU PDP dan peraturan
              pelaksanaannya. Pelanggaran yang diatur antara lain:
            </p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>Pasal 65: Pemrosesan data tanpa hak atau melawan hukum — pidana penjara dan/atau denda.</li>
              <li>Pasal 66: Penyediaan data pribadi tidak benar yang mengakibatkan kerugian — pidana penjara dan/atau denda.</li>
              <li>Pasal 67: Pembuatan atau penggunaan data palsu — pidana penjara dan/atau denda.</li>
            </ul>
          </Section>
        </div>

        {/* Consent action */}
        {isConsentFlow && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-gray-900">Personal Data Processing Consent</p>
              <p className="text-sm text-gray-600">
                By clicking "I Agree", you confirm that you have read, understood, and consent to the
                collection and processing of your personal data by {COMPANY_NAME} in accordance with
                this Privacy Policy and Law No. 27 of 2022 on Personal Data Protection (UU PDP).
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Button
                onClick={handleAgree}
                loading={consenting}
                disabled={agreed}
                className={cn(
                  'bg-[var(--primary)] hover:bg-[#003268] text-white min-w-40',
                  agreed && 'bg-green-600 hover:bg-green-600',
                )}
              >
                {agreed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Agreed
                  </>
                ) : consenting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    I Agree
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500">
                You may withdraw your consent at any time via My Profile.
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-center text-gray-400">
          © {new Date().getFullYear()} {COMPANY_NAME} · Privacy Policy in accordance with UU PDP No. 27/2022 · Last updated: {LAST_UPDATED}
        </p>
      </div>
    </div>
  );
}
