import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, ImageIcon } from 'lucide-react';

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80';

export default function AdminHeroBanner() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const { data: currentUrl } = useQuery({
    queryKey: ['site-settings', 'hero_banner_url'],
    queryFn: () => base44.entities.SiteSettings.get('hero_banner_url'),
    placeholderData: DEFAULT_BANNER,
  });

  const saveMutation = useMutation({
    mutationFn: (val) => base44.entities.SiteSettings.set('hero_banner_url', val),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'hero_banner_url'] });
      setUrl('');
      setError('');
    },
    onError: (err) => setError(err?.message || 'Erreur lors de l\'enregistrement'),
  });

  const displayUrl = url || currentUrl || DEFAULT_BANNER;

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUrl(file_url);
    } catch (err) {
      setError(err?.message || 'Échec de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    const value = url.trim() || displayUrl;
    if (!value) return;
    saveMutation.mutate(value);
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-100">
        <CardHeader>
          <CardTitle className="text-base font-bold text-[#1B1F3B] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#FF6B00]" />
            Bannière de la page d'accueil
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            L'image affichée dans la section héro du site (visible sur desktop).
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Aperçu */}
          <div>
            <Label className="text-sm font-semibold text-[#1B1F3B]">Aperçu</Label>
            <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 max-w-md">
              <img
                src={displayUrl}
                alt="Bannière"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = DEFAULT_BANNER;
                }}
              />
            </div>
          </div>

          {/* Upload */}
          <div>
            <Label className="text-sm font-semibold text-[#1B1F3B]">Changer l'image</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Télécharger une image
              </Button>
            </div>
          </div>

          {/* URL manuelle */}
          <div>
            <Label className="text-sm font-semibold text-[#1B1F3B]">Ou coller une URL</Label>
            <Input
              className="mt-1"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || !displayUrl}
            className="bg-[#FF6B00] hover:bg-[#E55D00] text-white"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Enregistrer la bannière
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
