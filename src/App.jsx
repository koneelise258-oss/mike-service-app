import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Wrench, ShieldCheck, Smartphone, ShoppingBag, Calculator, Settings, CheckCircle, Plus, Trash2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('client');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);

  // États pour le devis / négociation
  const [selectedService, setSelectedService] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [clientBudget, setClientBudget] = useState('');
  const [estimateResult, setEstimateResult] = useState(null);

  useEffect(() => {
    fetchServices();
    fetchProducts();
  }, []);

  async function fetchServices() {
    const { data } = await supabase.from('services').select('*');
    if (data) setServices(data);
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  }

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPin === '1234') { // PIN de démonstration
      setIsAdmin(true);
    } else {
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
