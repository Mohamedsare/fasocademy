import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsBar from '@/components/common/StatsBar';
import { User, Phone, Save, LogOut, Award, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { AuthAPI } from '@/lib/api';

export default function Profile() {
  const { user: authUser, isAuthenticated, refreshUser, logout } = useAuth();
  const [user, setUser] = useState(authUser || null);
  const [form, setForm] = useState({ phone: '', bio: '', payment_method: 'orange_money', payment_phone: '' });
  const [saving, setSaving] = useState(false);

  const [authTab, setAuthTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setForm({
        phone: authUser.phone || '',
        bio: authUser.bio || '',
        payment_method: authUser.payment_method || 'orange_money',
        payment_phone: authUser.payment_phone || '',
      });
    } else {
      setUser(null);
    }
  }, [authUser]);

  const { data: enrollments } = useQuery({
    queryKey: ['my-enrollments-profile', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const handleSave = async () => {
    setSaveError('');
    setSaving(true);
    try {
      await base44.auth.updateMe(form);
      await refreshUser();
    } catch (err) {
      setSaveError(err?.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await AuthAPI.signIn(loginEmail.trim(), loginPassword);
      await refreshUser();
    } catch (err) {
      setAuthError(err?.message || 'Erreur de connexion. Vérifie ton email et mot de passe.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await AuthAPI.signUp(signupEmail.trim(), signupPassword, signupName.trim());
      await refreshUser();
    } catch (err) {
      setAuthError(err?.message || 'Erreur d\'inscription. Réessaie ou utilise un autre email.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm dark:shadow-gray-900/50">
          <h1 className="text-2xl font-extrabold text-[#1B1F3B] dark:text-gray-100 mb-2">Connexion / Inscription</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Accède à ton espace FasoCademy</p>

          <Tabs value={authTab} onValueChange={(v) => { setAuthTab(v); setAuthError(''); }}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger type="button" value="login">Connexion</TabsTrigger>
              <TabsTrigger type="button" value="signup">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login" forceMount className="data-[state=inactive]:hidden">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="toi@exemple.com" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" required className="mt-1" />
                </div>
                {authError && <p className="text-sm text-red-500">{authError}</p>}
                <Button type="submit" disabled={authLoading} className="w-full bg-[#FF6B00] hover:bg-[#E55D00] text-white">
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Se connecter'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" forceMount className="data-[state=inactive]:hidden">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Nom complet</Label>
                  <Input id="signup-name" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Jean Dupont" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="toi@exemple.com" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="signup-password">Mot de passe (min. 6 caractères)</Label>
                  <Input id="signup-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="mt-1" />
                </div>
                {authError && <p className="text-sm text-red-500">{authError}</p>}
                <Button type="submit" disabled={authLoading} className="w-full bg-[#00C9A7] hover:bg-[#00B396] text-white">
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Créer mon compte'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  const completedCount = enrollments.filter(e => e.status === 'completed').length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6B00]/10 dark:bg-orange-500/20 flex items-center justify-center text-[#FF6B00] dark:text-orange-400 font-bold text-2xl">
            {user.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1B1F3B] dark:text-gray-100">{user.full_name}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>
        <StatsBar streak={user.streak_days || 0} xp={user.xp_points || 0} coursesCompleted={completedCount} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 text-center">
          <BookOpen className="w-8 h-8 text-[#FF6B00] dark:text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-extrabold text-[#1B1F3B] dark:text-gray-100">{enrollments.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Cours inscrits</div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 text-center">
          <Award className="w-8 h-8 text-[#00C9A7] dark:text-emerald-400 mx-auto mb-2" />
          <div className="text-2xl font-extrabold text-[#1B1F3B] dark:text-gray-100">{completedCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Cours terminés</div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-5">
        <h2 className="text-lg font-bold text-[#1B1F3B] dark:text-gray-100">Modifier mon profil</h2>

        <div>
          <Label>Téléphone</Label>
          <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+226 70 00 00 00" className="mt-1" />
        </div>

        <div>
          <Label>Bio</Label>
          <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Parle-nous de toi..." className="mt-1" rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Méthode de paiement</Label>
            <Select value={form.payment_method} onValueChange={v => setForm({ ...form, payment_method: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="orange_money">Orange Money</SelectItem>
                <SelectItem value="moov_money">Moov Money</SelectItem>
                <SelectItem value="wave">Wave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>N° Mobile Money</Label>
            <Input value={form.payment_phone} onChange={e => setForm({ ...form, payment_phone: e.target.value })} placeholder="+226..." className="mt-1" />
          </div>
        </div>

        {saveError && <p className="text-sm text-red-500">{saveError}</p>}
        <div className="flex gap-3 pt-2">
          <Button type="button" onClick={handleSave} disabled={saving} className="bg-[#FF6B00] hover:bg-[#E55D00] text-white">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Enregistrer
          </Button>
          <Button type="button" variant="outline" onClick={() => logout()} className="text-red-500 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/50">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
}