import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [view, setView] = useState('client');
  const [adminAuth, setAdminAuth] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
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
      } else {
        alert("Erreur lors de l'envoi : " + error.message);
      }
    } catch (err) {
      alert("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      setAdminAuth(true);
    } else {
      alert('Mot de passe incorrect !');
    }
  };

  return (
    <div style={styles.body}>
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
                  <option>Autre service</option>
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

                <label style={styles.label}>Précisions / Détails (Optionnel)</label>
                <textarea
                  style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                  placeholder="Expliquez votre problème..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />

                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? 'Patientez...' : '📩 Envoyer ma proposition'}
                </button>
              </form>
            )}
          </div>
        </main>
      )}

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
                <h2 style={{ fontSize: '20px' }}>📋 Offres reçues ({estimates.length})</h2>
                <button onClick={fetchEstimates} style={styles.refreshBtn}>🔄 Rafraîchir</button>
              </div>

              {estimates.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>Aucune demande reçue pour le moment.</p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {estimates.map((item) => (
                    <div key={item.id} style={styles.adminCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                        <strong style={{ color: '#D4AF37', fontSize: '16px' }}>{item.service}</strong>
                        <span style={styles.priceTag}>{item.proposed_budget} FCFA</span>
                      </div>
                      <p style={{ margin: '6px 0', fontSize: '14px' }}>📱 <strong>Appareil :</strong> {item.model}</p>
                      <p style={{ margin: '6px 0', fontSize: '14px' }}>📞 <strong>Contact :</strong> {item.phone}</p>
                      {item.notes && <p style={{ margin: '6px 0', fontSize: '13px', color: '#aaa' }}>📝 <strong>Notes :</strong> {item.notes}</p>}
                      <a 
                        href={`https://wa.me/${item.phone ? item.phone.replace(/[^0-9]/g, '') : ''}`} 
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

const styles = {
  body: { backgroundColor: '#121212', color: '#FFFFFF', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#1E1E1E', borderBottom: '1px solid #333' },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoBadge: { width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #D4AF37, #AA7C11)', color: '#000', fontWeight: 'bold', display: 'flex', itemsCenter: 'center', justifyContent: 'center', fontSize: '20px' },
  logoTitle: { fontSize: '16px', margin: 0, fontWeight: 'bold' },
  logoSub: { fontSize: '11px', margin: 0, color: '#888' },
  adminToggleBtn: { backgroundColor: '#2A2A2A', color: '#D4AF37', border: '1px solid #D4AF37', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px 15px' },
  hero: { textAlign: 'center', margin: '20px 0 30px 0' },
  badge: { backgroundColor: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', border: '1px solid #D4AF37' },
  heroTitle: { fontSize: '24px', margin: '15px 0 10px 0', lineHeight: '1.3' },
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
};
