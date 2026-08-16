import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [view, setView] = useState('client'); // 'client' ou 'admin'
  const [adminAuth, setAdminAuth] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // États formulaire client
  const [formData, setFormData] = useState({
    service: 'Réparation écran',
    model: '',
    budget: '',
    phone: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [estimates, setEstimates] = useState([]);

  // Charger les demandes pour l'espace Admin
  useEffect(() => {
    if (adminAuth) {
      fetchEstimates();
    }
  }, [adminAuth]);

  const fetchEstimates = async () => {
    const { data } = await supabase.from('estimates').select('*').order('created_at', { ascending: false });
    if (data) setEstimates(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('estimates').insert([{
        service: formData.service,
        model: formData.model,
        proposed_budget: formData.budget,
        phone: formData.phone,
        notes: formData.notes
      }]);
      if (!error) {
        setSuccess(true);
        setFormData({ service: 'Réparation écran', model: '', budget: '', phone: '', notes: '' });
      }
    } catch (err) {
      alert("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'admin123') { // Ton mot de passe admin par défaut
      setAdminAuth(true);
    } else {
      alert('Mot de passe incorrect !');
    }
  };

  return (
    <div style={styles.body}>
      {/* Header Navbar */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logoBadge}>M</div>
          <div>
            <h1 style={styles.logoTitle}>MIKE SERVICE <span style={{ color: '#D4AF37' }}>CI</span></h1>
            <p style={styles.logoSub}>Expert Smartphone & Accessoires</p>
          </div>
        </div>
        <button 
          onClick={() => setView(view === 'client' ? 'admin' : 'client')}
          style={styles.adminToggleBtn}
        >
          {view === 'client' ? '🔒 Espace Admin' : '📱 Vue Client'}
        </button>
      </header>

      {/* VUE CLIENT */}
      {view === 'client' && (
        <main style={styles.container}>
          <section style={styles.hero}>
            <span style={styles.badge}>⚡ Service Rapide & Garanti</span>
            <h2 style={styles.heroTitle}>Confiez votre smartphone à des <span style={{ color: '#D4AF37' }}>experts</span></h2>
            <p style={styles.heroSub}>Réparation d'écran, batterie, connecteur de charge et accessoires d'origine.</p>
          </section>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📊 Estimation & Négociation de Tarif</h3>
            <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px' }}>
              Proposez votre budget en direct et nous vous recontacterons !
            </p>

            {success ? (
              <div style={styles.successBox}>
                ✅ <strong>Demande reçue avec succès !</strong>
                <p style={{ fontSize: '13px', marginTop: '5px' }}>Nous analysons votre offre et vous recontactons rapidement.</p>
                <button onClick={() => setSuccess(false)} style={styles.resetBtn}>Envoyer une autre demande</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>Service Requis</label>
                <select 
                  style={styles.input} 
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                >
                  <option>Réparation écran</option>
                  <option>Changement de batterie</option>
                  <option>Connecteur de charge</option>
                  <option>Achat d'accessoires</option>
                  <option>Déblocage / Flashage</option>
                </select>

                <label style={styles.label}>Modèle de l'appareil</label>
                <input 
                  style={styles.input} 
                  type="text" 
                  placeholder="Ex: iPhone 11, Samsung A12..." 
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                />

                <label style={styles.label}>Votre Budget Proposé (FCFA)</label>
                <input 
                  style={styles.input} 
                  type="number" 
                  placeholder="Ex: 15000" 
                  required
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                />

                <label style={styles.label}>Téléphone / WhatsApp</label>
                <input 
                  style={styles.input} 
                  type="tel" 
                  placeholder="Ex: 07 00 00 00 00" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />

                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? 'Patientez...' : '📩 Envoyer ma proposition'}
                </button>
              </form>
            )}
          </div>
        </main>
      )}

      {/* VUE ADMIN */}
      {view === 'admin' && (
        <main style={styles.container}>
          {!adminAuth ? (
            <div style={{ ...styles.card, maxWidth: '400px', margin: '40px auto' }}>
              <h3 style={styles.cardTitle}>🔑 Connexion Administrateur</h3>
              <form onSubmit={handleAdminLogin} style={styles.form}>
                <label style={styles.label}>Mot de passe Admin</label>
                <input 
                  type="password" 
                  style={styles.input} 
                  placeholder="Entrez le mot de passe"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
                <button type="submit" style={styles.submitBtn}>Se connecter</button>
                <p style={{ fontSize: '11px', color: '#888', textAlign: 'center' }}>Mot de passe par défaut : admin123</p>
              </form>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>📋 Tableau de bord - Offres reçues ({estimates.length})</h2>
                <button onClick={fetchEstimates} style={styles.refreshBtn}>🔄 Rafraîchir</button>
              </div>

              {estimates.length === 0 ? (
                <p style={{ color: '#888' }}>Aucune demande reçue pour le moment.</p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {estimates.map((item) => (
                    <div key={item.id} style={styles.adminCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', pb: '10px' }}>
                        <strong style={{ color: '#D4AF37' }}>{item.service}</strong>
                        <span style={styles.priceTag}>{item.proposed_budget} FCFA</span>
                      </div>
                      <p style={{ margin: '8px 0', fontSize: '14px' }}>📱 <strong>Appareil :</strong> {item.model}</p>
                      <p style={{ margin: '8px 0', fontSize: '14px' }}>📞 <strong>Contact :</strong> {item.phone}</p>
                      <a 
                        href={`https://wa.me/${item.phone}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={styles.whatsappLink}
                      >
                        💬 Répondre sur WhatsApp
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      )}
    </div>
  );
}

// STYLES INLINE (Garanti propre sur tous les navigateurs)
const styles = {
  body: { backgroundColor: '#121212', color: '#FFFFFF', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', paddingBottom: '40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#1E1E1E', borderBottom: '1px solid #333' },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoBadge: { width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #D4AF37, #AA7C11)', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '20px' },
  logoTitle: { fontSize: '16px', margin: 0, fontWeight: 'bold' },
  logoSub: { fontSize: '11px', margin: 0, color: '#888' },
  adminToggleBtn: { backgroundColor: '#2A2A2A', color: '#D4AF37', border: '1px solid #D4AF37', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px 15px' },
  hero: { textAlign: 'center', margin: '20px 0 30px 0' },
  badge: { backgroundColor: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', border: '1px solid #D4AF37' },
  heroTitle: { fontSize: '26px', margin: '15px 0 10px 0' },
  heroSub: { color: '#AAA', fontSize: '14px', margin: 0 },
  card: { backgroundColor: '#1E1E1E', borderRadius: '16px', padding: '20px', border: '1px solid #333', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' },
  cardTitle: { fontSize: '18px', margin: '0 0 5px 0', color: '#FFF' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { fontSize: '12px', color: '#DDD', fontWeight: 'bold', textTransform: 'uppercase' },
  input: { backgroundColor: '#121212', border: '1px solid #444', color: '#FFF', padding: '12px', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  submitBtn: { backgroundColor: '#D4AF37', color: '#000', fontWeight: 'bold', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', marginTop: '10px' },
  successBox: { backgroundColor: '#143823', border: '1px solid #28a745', padding: '15px', borderRadius: '8px', textAlign: 'center', color: '#85ed97' },
  resetBtn: { backgroundColor: 'transparent', border: 'none', color: '#D4AF37', textDecoration: 'underline', marginTop: '10px', cursor: 'pointer' },
  adminCard: { backgroundColor: '#252525', padding: '15px', borderRadius: '10px', border: '1px solid #333' },
  priceTag: { backgroundColor: '#D4AF37', color: '#000', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' },
  whatsappLink: { display: 'inline-block', marginTop: '10px', backgroundColor: '#25D366', color: '#FFF', padding: '8px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' },
  refreshBtn: { backgroundColor: '#333', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }
};    } else {
      alert('Code PIN incorrect');
    }
  };

  const calculateEstimate = (e) => {
    e.preventDefault();
    const budget = parseFloat(clientBudget) || 0;
    const basePrice = 25000; // Prix indicatif de base FCFA
    
    let status = 'accord';
    let suggestedPrice = basePrice;

    if (budget < basePrice * 0.7) {
      status = 'refus';
    } else if (budget < basePrice) {
      status = 'negociation';
      suggestedPrice = Math.round((budget + basePrice) / 2);
    }

    setEstimateResult({ status, suggestedPrice, basePrice, budget });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] font-sans pb-12">
      {/* En-tête */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
              M
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Mike Service CI</h1>
              <p className="text-xs text-gray-500">Réparation & Accessoires Smartphone</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab(activeTab === 'client' ? 'admin' : 'client')}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            {activeTab === 'client' ? <Settings size={20} /> : <Wrench size={20} />}
          </button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto px-4 mt-6">
        {activeTab === 'client' ? (
          <div className="space-y-8">
            {/* Bannière d'accueil */}
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
              <span className="gold-text text-sm font-semibold tracking-wide uppercase">Service Rapide & Garanti</span>
              <h2 className="text-2xl font-bold mt-1 mb-2">Confiez votre smartphone à des experts</h2>
              <p className="text-gray-600 text-sm max-w-md mx-auto">
                Réparation d'écran, changement de batterie, connecteur de charge et vente d'accessoires d'origine.
              </p>
            </section>

            {/* Calculateur de Devis & Négociation */}
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Calculator className="gold-text" size={24} />
                <h3 className="text-lg font-bold">Estimation & Négociation de Tarif</h3>
              </div>
              <form onSubmit={calculateEstimate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Service requis</label>
                  <select 
                    value={selectedService} 
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#B89A5A]"
                    required
                  >
                    <option value="">Sélectionnez un service</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.nom}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Modèle de l'appareil</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Samsung S21, iPhone 12..."
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#B89A5A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Votre budget proposé (FCFA)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 20000"
                    value={clientBudget}
                    onChange={(e) => setClientBudget(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#B89A5A]"
                    required
                  />
                </div>

                <button type="submit" className="w-full py-3.5 gold-gradient text-white font-semibold rounded-xl shadow-md">
                  Evaluer ma demande
                </button>
              </form>

              {estimateResult && (
                <div className="mt-6 p-4 rounded-xl border border-gray-100 bg-gray-50">
                  {estimateResult.status === 'accord' && (
                    <div className="text-emerald-700 font-semibold">
                      Budget accepté ! Nous pouvons effectuer la réparation pour {estimateResult.budget} FCFA.
                    </div>
                  )}
                  {estimateResult.status === 'negociation' && (
                    <div className="text-amber-700 font-semibold">
                      Budget légèrement en dessous du tarif standard. Contre-proposition : {estimateResult.suggestedPrice} FCFA.
                    </div>
                  )}
                  {estimateResult.status === 'refus' && (
                    <div className="text-rose-700 font-semibold">
                      Budget insuffisant pour couvrir les pièces de rechange. Tarif minimal : {estimateResult.basePrice} FCFA.
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        ) : (
          /* Espace Admin */
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            {!isAdmin ? (
              <form onSubmit={handleAdminLogin} className="space-y-4 max-w-xs mx-auto text-center">
                <h3 className="text-lg font-bold">Accès Administrateur</h3>
                <input 
                  type="password" 
                  placeholder="Code PIN (par défaut : 1234)"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full p-3 text-center tracking-widest text-lg rounded-xl border border-gray-200 bg-gray-50 focus:outline-none"
                />
                <button type="submit" className="w-full py-3 bg-black text-white font-semibold rounded-xl">
                  Se connecter
                </button>
              </form>
            ) : (
              <div>
                <h3 className="text-lg font-bold mb-4">Panneau de Gestion Admin</h3>
                <p className="text-sm text-gray-500">Connecté avec succès. Vous pouvez gérer vos prestations et accessoires.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
    }
