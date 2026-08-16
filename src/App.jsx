import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [view, setView] = useState('client'); // 'client' ou 'admin'
  const [adminTab, setAdminTab] = useState('requests'); // 'requests' ou 'catalog'
  const [adminAuth, setAdminAuth] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Données dynamiques Supabase
  const [brands, setBrands] = useState([]);
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);

  // Formulaire Admin (Ajout de Marque & Service)
  const [newBrandName, setNewBrandName] = useState('');
  const [newServiceName, setNewServiceName] = useState('');

  // Formulaire Client
  const [selectedBrand, setSelectedBrand] = useState('');
  const [modelName, setModelName] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [quality, setQuality] = useState('Original');
  const [clientName, setClientName] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Moteur de négociation
  const [initialPrice] = useState(15000);
  const [minPrice] = useState(12000);
  const [agreedPrice, setAgreedPrice] = useState(15000);

  const [loading, setLoading] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (adminAuth) {
      fetchRequests();
    }
  }, [adminAuth]);

  const loadInitialData = async () => {
    try {
      const { data: bData } = await supabase.from('brands').select('*').order('name');
      if (bData && bData.length > 0) {
        setBrands(bData);
        setSelectedBrand(bData[0].name);
      }
      const { data: sData } = await supabase.from('repair_services').select('*').order('name');
      if (sData && sData.length > 0) {
        setServices(sData);
        setSelectedService(sData[0].name);
      }
    } catch (err) {
      console.error("Erreur de chargement :", err);
    }
  };

  const fetchRequests = async () => {
    const { data } = await supabase.from('repair_requests').select('*').order('created_at', { ascending: false });
    if (data) setRequests(data);
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    const { error } = await supabase.from('brands').insert([{ name: newBrandName.trim() }]);
    if (!error) {
      setNewBrandName('');
      loadInitialData();
      alert('Marque ajoutée avec succès !');
    } else {
      alert('Erreur lors de l\'ajout de la marque');
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    const { error } = await supabase.from('repair_services').insert([{ name: newServiceName.trim() }]);
    if (!error) {
      setNewServiceName('');
      loadInitialData();
      alert('Service ajouté avec succès !');
    } else {
      alert('Erreur lors de l\'ajout du service');
    }
  };

  const handleNegotiateDown = () => {
    if (agreedPrice - 500 >= minPrice) {
      setAgreedPrice(agreedPrice - 500);
    }
  };

  const handleNegotiateUp = () => {
    if (agreedPrice + 500 <= initialPrice) {
      setAgreedPrice(agreedPrice + 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const refNo = 'MSCI-' + Math.floor(100000 + Math.random() * 900000);

    const payload = {
      reference_no: refNo,
      client_name: clientName,
      whatsapp_number: whatsappPhone,
      brand_name: selectedBrand,
      model_name: modelName,
      service_name: selectedService,
      quality_name: quality,
      issue_description: notes,
      initial_price: initialPrice,
      agreed_price: agreedPrice,
      status: 'EN ATTENTE'
    };

    try {
      const { data, error } = await supabase.from('repair_requests').insert([payload]).select();
      if (!error && data && data.length > 0) {
        setSubmittedRequest(data[0]);
      } else {
        setSubmittedRequest(payload);
      }
    } catch (err) {
      setSubmittedRequest(payload);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      setAdminAuth(true);
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const generateWhatsappMsg = (req) => {
    const text = `*MIKE SERVICE CI — DEMANDE DE RÉPARATION*%0A%0A` +
      `*Référence :* ${req.reference_no}%0A` +
      `*Client :* ${req.client_name}%0A` +
      `*Appareil :* ${req.brand_name} ${req.model_name}%0A` +
      `*Service :* ${req.service_name} (${req.quality_name})%0A` +
      `*Prix Initial :* ${req.initial_price} FCFA%0A` +
      `*Prix Proposé :* ${req.agreed_price} FCFA%0A` +
      `*Notes :* ${req.issue_description || 'Aucune'}%0A%0A` +
      `Bonjour MIKE SERVICE CI, je souhaite effectuer cette réparation.`;
    return `https://wa.me/2250544311217?text=${text}`;
  };

  return (
    <div style={styles.body}>
      {/* Header / Navigation */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logoBadge}>M</div>
          <div>
            <h1 style={styles.logoTitle}>MIKE SERVICE <span style={{ color: '#B89A5A' }}>CI</span></h1>
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
            <span style={styles.badge}>⚡ Service Premium & Garanti</span>
            <h2 style={styles.heroTitle}>
              Confiez votre smartphone à des <span style={{ color: '#B89A5A' }}>experts</span>
            </h2>
            <p style={styles.heroSub}>
              Estimation rapide, pièces certifiées et tarifs négociables en direct.
            </p>
          </section>

          <div style={styles.card}>
            {submittedRequest ? (
              <div style={styles.successBox}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📋</div>
                <h3 style={{ margin: '0 0 10px 0', color: '#111' }}>Demande enregistrée !</h3>
                <p style={{ fontSize: '14px', color: '#555', marginBottom: '5px' }}>
                  Référence : <strong>{submittedRequest.reference_no}</strong>
                </p>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
                  Tarif négocié proposé : <strong style={{ color: '#B89A5A' }}>{submittedRequest.agreed_price} FCFA</strong>
                </p>

                <a 
                  href={generateWhatsappMsg(submittedRequest)} 
                  target="_blank" 
                  rel="noreferrer"
                  style={styles.whatsappBtn}
                >
                  💬 Continuer sur WhatsApp
                </a>

                <button 
                  onClick={() => setSubmittedRequest(null)}
                  style={styles.resetBtn}
                >
                  Faire une autre demande
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={styles.form}>
                <h3 style={styles.cardTitle}>📱 Sélection de l'appareil & Service</h3>
                
                {/* 1. Marque */}
                <label style={styles.label}>1. Marque</label>
                <select 
                  style={styles.input}
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                >
                  {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>

                {/* 2. Modèle */}
                <label style={styles.label}>2. Modèle de l'appareil</label>
                <input 
                  type="text" 
                  style={styles.input} 
                  placeholder="Ex: Spark 40, Galaxy A15, iPhone 13..." 
                  required
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                />

                {/* 3. Service */}
                <label style={styles.label}>3. Service Requis</label>
                <select 
                  style={styles.input}
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>

                {/* 4. Qualité */}
                <label style={styles.label}>4. Qualité de la pièce</label>
                <select 
                  style={styles.input}
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                >
                  <option value="Original">Originale (Haute Qualité)</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="TFT">TFT / Économique</option>
                </select>

                {/* Moteur de Négociation */}
                <div style={styles.negotiationBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#111' }}>💰 Tarif Estimé</span>
                    <span style={{ fontSize: '12px', color: '#777', textDecoration: 'line-through' }}>{initialPrice} FCFA</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                    <button type="button" onClick={handleNegotiateDown} style={styles.negoBtn}>- 500 FCFA</button>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#B89A5A' }}>{agreedPrice} FCFA</span>
                    <button type="button" onClick={handleNegotiateUp} style={styles.negoBtn}>+ 500 FCFA</button>
                  </div>
                  <p style={{ fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '8px', marginBottom: 0 }}>
                    {agreedPrice < initialPrice ? `Offre négociée ! (Prix min: ${minPrice} FCFA)` : "Proposez votre tarif !"}
                  </p>
                </div>

                {/* Coordonnées Client */}
                <h3 style={{ ...styles.cardTitle, marginTop: '15px' }}>👤 Vos Coordonnées</h3>

                <label style={styles.label}>Nom complet</label>
                <input 
                  type="text" 
                  style={styles.input} 
                  placeholder="Ex: Jean Kouassi" 
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />

                <label style={styles.label}>Numéro WhatsApp</label>
                <input 
                  type="tel" 
                  style={styles.input} 
                  placeholder="Ex: 05 00 00 00 00" 
                  required
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                />

                <label style={styles.label}>Précisions / Panne (Optionnel)</label>
                <textarea 
                  style={{ ...styles.input, height: '70px', resize: 'vertical' }}
                  placeholder="Expliquez votre problème..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? 'Traitement...' : '📩 Envoyer la demande & Devis'}
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
              <h3 style={styles.cardTitle}>🔑 Espace Administrateur</h3>
              <form onSubmit={handleAdminLogin} style={styles.form}>
                <label style={styles.label}>Mot de passe</label>
                <input 
                  type="password" 
                  style={styles.input} 
                  placeholder="Entrez le mot de passe"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
                <button type="submit" style={styles.submitBtn}>Se connecter</button>
              </form>
            </div>
          ) : (
            <div>
              {/* Tabs Admin */}
              <div style={styles.adminTabNav}>
                <button 
                  onClick={() => setAdminTab('requests')}
                  style={{ ...styles.tabBtn, backgroundColor: adminTab === 'requests' ? '#111111' : '#FFFFFF', color: adminTab === 'requests' ? '#FFFFFF' : '#111111' }}
                >
                  📋 Demandes Client
                </button>
                <button 
                  onClick={() => setAdminTab('catalog')}
                  style={{ ...styles.tabBtn, backgroundColor: adminTab === 'catalog' ? '#111111' : '#FFFFFF', color: adminTab === 'catalog' ? '#FFFFFF' : '#111111' }}
                >
                  ⚙️ Gestion Catalogue
                </button>
              </div>

              {adminTab === 'requests' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', color: '#111' }}>Demandes Récentes ({requests.length})</h2>
                    <button onClick={fetchRequests} style={styles.refreshBtn}>🔄 Actualiser</button>
                  </div>

                  {requests.length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>Aucune demande enregistrée.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                      {requests.map((item) => (
                        <div key={item.id} style={styles.adminCard}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E8E6', paddingBottom: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#B89A5A' }}>{item.reference_no}</span>
                            <span style={styles.priceTag}>{item.agreed_price} FCFA</span>
                          </div>
                          <p style={{ margin: '4px 0', fontSize: '14px', color: '#111' }}>👤 <strong>Client :</strong> {item.client_name}</p>
                          <p style={{ margin: '4px 0', fontSize: '14px', color: '#111' }}>📱 <strong>Appareil :</strong> {item.brand_name} {item.model_name}</p>
                          <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}>🛠️ <strong>Service :</strong> {item.service_name} ({item.quality_name})</p>
                          <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}>📞 <strong>WhatsApp :</strong> {item.whatsapp_number}</p>
                          {item.issue_description && <p style={{ margin: '4px 0', fontSize: '13px', color: '#777' }}>📝 <strong>Notes :</strong> {item.issue_description}</p>}
                          
                          <a 
                            href={`https://wa.me/${item.whatsapp_number ? item.whatsapp_number.replace(/[^0-9]/g, '') : ''}`}
                            target="_blank" 
                            rel="noreferrer"
                            style={styles.adminWhatsappLink}
                          >
                            💬 Répondre directement
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* Ajouter une marque */}
                  <div style={styles.card}>
                    <h3 style={styles.cardTitle}>➕ Ajouter une Marque</h3>
                    <form onSubmit={handleAddBrand} style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        style={{ ...styles.input, flex: 1 }} 
                        placeholder="Ex: Xiaomi, Huawei, Honor..."
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                      />
                      <button type="submit" style={{ ...styles.submitBtn, marginTop: 0, padding: '10px 15px' }}>Ajouter</button>
                    </form>
                  </div>

                  {/* Ajouter un service */}
                  <div style={styles.card}>
                    <h3 style={styles.cardTitle}>🛠️ Ajouter un Service de Réparation</h3>
                    <form onSubmit={handleAddService} style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        style={{ ...styles.input, flex: 1 }} 
                        placeholder="Ex: Déblocage Réseau, Changement Caméra..."
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                      />
                      <button type="submit" style={{ ...styles.submitBtn, marginTop: 0, padding: '10px 15px' }}>Ajouter</button>
                    </form>
                  </div>
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
  body: { backgroundColor: '#FAFAF8', color: '#111111', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E8E6' },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoBadge: { width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#111111', color: '#B89A5A', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  logoTitle: { fontSize: '16px', margin: 0, fontWeight: 'bold', color: '#111111' },
  logoSub: { fontSize: '11px', margin: 0, color: '#777777' },
  adminToggleBtn: { backgroundColor: '#FAFAF8', color: '#111111', border: '1px solid #E8E8E6', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  container: { maxWidth: '550px', margin: '0 auto', padding: '20px 15px' },
  hero: { textAlign: 'center', margin: '20px 0 25px 0' },
  badge: { backgroundColor: '#FFFFFF', color: '#B89A5A', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', border: '1px solid #B89A5A', fontWeight: 'bold' },
  heroTitle: { fontSize: '24px', margin: '15px 0 10px 0', lineHeight: '1.3', color: '#111111' },
  heroSub: { color: '#666666', fontSize: '14px', margin: 0 },
  card: { backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid #E
