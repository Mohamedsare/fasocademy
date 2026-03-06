import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyCertificate() {
  const urlParams = new URLSearchParams(window.location.search);
  const [certNumber, setCertNumber] = useState(urlParams.get('id') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const verify = async () => {
    if (!certNumber.trim()) return;
    setLoading(true);
    setSearched(true);
    const certs = await base44.entities.Certificate.filter({ certificate_number: certNumber.trim() });
    setResult(certs.length > 0 ? certs[0] : null);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-[#FF6B00]" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#1B1F3B] mb-2">Vérifier un certificat</h1>
        <p className="text-gray-500">Entrez le numéro du certificat pour vérifier son authenticité</p>
      </div>

      <div className="flex gap-3 mb-8">
        <Input
          value={certNumber}
          onChange={e => setCertNumber(e.target.value)}
          placeholder="Numéro du certificat..."
          className="h-12 text-base"
          onKeyDown={e => e.key === 'Enter' && verify()}
        />
        <Button onClick={verify} disabled={loading} className="bg-[#FF6B00] hover:bg-[#E55D00] text-white h-12 px-6">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </Button>
      </div>

      {searched && !loading && (
        result ? (
          <div className="bg-gradient-to-br from-[#E6FBF6] to-white rounded-2xl border border-[#00C9A7]/20 p-8 text-center">
            <CheckCircle className="w-12 h-12 text-[#00C9A7] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1B1F3B] mb-4">Certificat vérifié ✓</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Titulaire :</strong> {result.user_name}</p>
              <p><strong>Formation :</strong> {result.course_title}</p>
              <p><strong>Formateur :</strong> {result.instructor_name}</p>
              <p><strong>Date :</strong> {new Date(result.issued_date).toLocaleDateString('fr-FR')}</p>
              <p><strong>N° :</strong> {result.certificate_number}</p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 rounded-2xl border border-red-100 p-8 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700">Certificat non trouvé</h2>
            <p className="text-sm text-gray-500 mt-2">Vérifiez le numéro et réessayez</p>
          </div>
        )
      )}
    </div>
  );
}