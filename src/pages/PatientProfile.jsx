import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { 
  User, 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Activity, 
  Save, 
  Plus, 
  History, 
  TrendingUp, 
  Check, 
  X,
  Clock,
  Weight,
  Target,
  Maximize,
  Utensils,
  Coffee
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const PatientProfile = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // AI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  
  // Tabs State
  const [mainTab, setMainTab] = useState('dados'); // 'dados', 'consultas', 'planos'
  const [patientTab, setPatientTab] = useState('pessoal'); // 'pessoal', 'clinico', 'habitos'
  
  // Form State for Patient Data
  const [formData, setFormData] = useState({});
  
  // Modal State for New Consultation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newConsultation, setNewConsultation] = useState({
    data_consulta: new Date().toISOString().split('T')[0],
    peso: '',
    cintura: '',
    quadril: '',
    percentual_gordura: '',
    observacoes: '',
    proximo_retorno: ''
  });

  useEffect(() => {
    fetchPatientData();
    fetchConsultations();
    fetchMealPlans();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setPatient(data);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching patient profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', id)
        .order('data_consulta', { ascending: false });
      
      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const fetchMealPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('planos_alimentares')
        .select('*')
        .eq('paciente_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMealPlans(data || []);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    }
  };

  const handlePatientChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (value === 'Nenhum') return { ...prev, [field]: ['Nenhum'] };
      const filtered = current.filter(item => item !== 'Nenhum');
      if (filtered.includes(value)) {
        return { ...prev, [field]: filtered.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...filtered, value] };
      }
    });
  };

  const savePatientChanges = async () => {
    setSaveLoading(true);
    try {
      const { error } = await supabase
        .from('pacientes')
        .update(formData)
        .eq('id', id);
      
      if (error) throw error;
      setSuccessMsg('Alterações salvas com sucesso!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setPatient(formData);
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Erro ao salvar alterações.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!patient) return;
    setIsGenerating(true);
    setGeneratedPlan(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('gerar-plano', {
        body: { dados_do_paciente: patient }
      });
      
      if (error) throw error;

      if (data.error_amigavel) {
        alert(data.error_amigavel);
        return;
      }
      
      setGeneratedPlan(data.plano_semanal);
    } catch (error) {
      console.error('Erro ao gerar plano:', error);
      alert('Falha ao gerar plano: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan) return;
    setSaveLoading(true);
    try {
      const { error } = await supabase
        .from('planos_alimentares')
        .insert([{
          paciente_id: id,
          conteudo: { plano_semanal: generatedPlan }
        }]);

      if (error) throw error;
      setSuccessMsg('Plano alimentar salvo com sucesso!');
      setGeneratedPlan(null);
      fetchMealPlans();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error saving meal plan:', error);
      alert('Erro ao salvar plano alimentar.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEditMealOption = (dayIndex, mealKey, optionIndex, newValue) => {
    const updatedPlan = JSON.parse(JSON.stringify(generatedPlan));
    updatedPlan[dayIndex].refeicoes[mealKey][optionIndex] = newValue;
    setGeneratedPlan(updatedPlan);
  };

  const saveNewConsultation = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const { error } = await supabase
        .from('consultas')
        .insert([{
          ...newConsultation,
          paciente_id: id,
          peso: newConsultation.peso ? parseFloat(newConsultation.peso) : null,
          cintura: newConsultation.cintura ? parseFloat(newConsultation.cintura) : null,
          quadril: newConsultation.quadril ? parseFloat(newConsultation.quadril) : null,
          percentual_gordura: newConsultation.percentual_gordura ? parseFloat(newConsultation.percentual_gordura) : null
        }]);

      if (error) throw error;
      
      setIsModalOpen(false);
      setNewConsultation({
        data_consulta: new Date().toISOString().split('T')[0],
        peso: '',
        cintura: '',
        quadril: '',
        percentual_gordura: '',
        observacoes: '',
        proximo_retorno: ''
      });
      fetchConsultations();
    } catch (error) {
      console.error('Error saving consultation:', error);
      alert('Erro ao salvar consulta.');
    } finally {
      setSaveLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const chartData = [...consultations]
    .sort((a, b) => new Date(a.data_consulta) - new Date(b.data_consulta))
    .map(c => ({
      data: formatDate(c.data_consulta),
      peso: parseFloat(c.peso)
    }));

  if (loading) {
    return (
      <Layout>
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/pacientes" className="icon-box" style={{ padding: '0.5rem', backgroundColor: 'var(--white)', border: '1px solid var(--border-light)' }}>
            <ArrowLeft size={20} color="var(--text-main)" />
          </Link>
          <div>
            <h1 className="page-title">{patient.nome}</h1>
            <p className="page-subtitle">Prontuário completo do paciente.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {mainTab === 'dados' && (
            <button onClick={savePatientChanges} disabled={saveLoading} className="btn-primary" style={{ width: 'auto', padding: '0 1.5rem' }}>
              <Save size={18} style={{ marginRight: '0.5rem' }} />
              {saveLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          )}
          {mainTab === 'consultas' && (
            <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ width: 'auto', padding: '0 1.5rem' }}>
              <Plus size={18} style={{ marginRight: '0.5rem' }} />
              Nova Consulta
            </button>
          )}
          {mainTab === 'planos' && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              {generatedPlan && (
                <button onClick={handleSavePlan} disabled={saveLoading} className="btn-primary" style={{ width: 'auto', padding: '0 1.5rem', backgroundColor: '#10b981' }}>
                  <Save size={18} style={{ marginRight: '0.5rem' }} />
                  Salvar Plano
                </button>
              )}
              <button onClick={handleGeneratePlan} disabled={isGenerating} className="btn-primary" style={{ width: 'auto', padding: '0 1.5rem', background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)' }}>
                <Activity size={18} style={{ marginRight: '0.5rem' }} className={isGenerating ? 'animate-spin' : ''} />
                {isGenerating ? 'Gerando...' : 'Gerar com IA'}
              </button>
            </div>
          )}
        </div>
      </header>

      {successMsg && (
        <div className="animate-slide-up" style={{ padding: '1rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: '800' }}>
          <Check size={20} style={{ marginRight: '0.5rem' }} /> {successMsg}
        </div>
      )}

      <div className="tabs-container">
        <div className="tabs-list">
          <button className={`tab-trigger ${mainTab === 'dados' ? 'active' : ''}`} onClick={() => setMainTab('dados')}>Dados do Paciente</button>
          <button className={`tab-trigger ${mainTab === 'consultas' ? 'active' : ''}`} onClick={() => setMainTab('consultas')}>Consultas</button>
          <button className={`tab-trigger ${mainTab === 'planos' ? 'active' : ''}`} onClick={() => setMainTab('planos')}>Planos Alimentares</button>
        </div>
      </div>

      {mainTab === 'dados' && (
        <div className="animate-slide-up">
          <div className="tabs-list" style={{ borderBottom: 'none', marginBottom: '1.5rem', gap: '0.5rem' }}>
            {['pessoal', 'clinico', 'habitos'].map(t => (
              <button
                key={t}
                className={`tab-trigger ${patientTab === t ? 'active' : ''}`}
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', borderRadius: '10px', border: 'none', backgroundColor: patientTab === t ? 'var(--primary-light)' : 'transparent', color: patientTab === t ? 'var(--primary)' : 'var(--text-muted)' }}
                onClick={() => setPatientTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="form-section">
            {patientTab === 'pessoal' && (
              <div className="form-grid">
                <div className="input-group full-width">
                  <label className="input-label">Nome Completo</label>
                  <input name="nome" className="input-field" value={formData.nome || ''} onChange={handlePatientChange} />
                </div>
                <div className="input-group">
                  <label className="input-label">Data de Nascimento</label>
                  <input name="data_nascimento" type="date" className="input-field" value={formData.data_nascimento || ''} onChange={handlePatientChange} />
                </div>
                <div className="input-group">
                  <label className="input-label">Sexo</label>
                  <select name="sexo" className="input-field" value={formData.sexo || ''} onChange={handlePatientChange}>
                    <option value="">Selecione...</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">WhatsApp</label>
                  <input name="whatsapp" className="input-field" value={formData.whatsapp || ''} onChange={handlePatientChange} />
                </div>
                <div className="input-group">
                  <label className="input-label">E-mail</label>
                  <input name="email" type="email" className="input-field" value={formData.email || ''} onChange={handlePatientChange} />
                </div>
              </div>
            )}

            {patientTab === 'clinico' && (
              <div className="form-grid">
                <div className="input-group">
                  <label className="input-label">Peso Inicial (kg)</label>
                  <input name="peso_inicial" type="number" step="0.1" className="input-field" value={formData.peso_inicial || ''} onChange={handlePatientChange} />
                </div>
                <div className="input-group">
                  <label className="input-label">Altura (cm)</label>
                  <input name="altura" type="number" className="input-field" value={formData.altura || ''} onChange={handlePatientChange} />
                </div>
                <div className="input-group full-width">
                  <label className="input-label">Objetivos</label>
                  <div className="checkbox-group">
                    {['Emagrecer', 'Ganhar massa', 'Saúde geral', 'Performance esportiva'].map(obj => (
                      <label key={obj} className={`checkbox-item ${(formData.objetivos || []).includes(obj) ? 'active' : ''}`}>
                        <input type="checkbox" checked={(formData.objetivos || []).includes(obj)} onChange={() => handleMultiSelect('objetivos', obj)} /> {obj}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="input-group full-width">
                  <label className="input-label">Patologias</label>
                  <div className="checkbox-group">
                    {['Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Nenhum'].map(item => (
                      <label key={item} className={`checkbox-item ${(formData.patologias || []).includes(item) ? 'active' : ''}`}>
                        <input type="checkbox" checked={(formData.patologias || []).includes(item)} onChange={() => handleMultiSelect('patologias', item)} /> {item}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="input-group full-width">
                  <label className="input-label">Medicamentos e Suplementos</label>
                  <textarea name="medicamentos" className="input-field" style={{ minHeight: '100px' }} value={formData.medicamentos || ''} onChange={handlePatientChange}></textarea>
                </div>
              </div>
            )}

            {patientTab === 'habitos' && (
              <div className="form-grid">
                <div className="input-group">
                  <label className="input-label">Refeições por dia</label>
                  <input name="refeicoes_por_dia" type="number" className="input-field" value={formData.refeicoes_por_dia || ''} onChange={handlePatientChange} />
                </div>
                <div className="input-group">
                  <label className="input-label">Consumo de água (L)</label>
                  <input name="litros_agua" type="number" step="0.1" className="input-field" value={formData.litros_agua || ''} onChange={handlePatientChange} />
                </div>
                <div className="input-group">
                  <label className="input-label">Horário que acorda</label>
                  <input name="horario_acorda" className="input-field" value={formData.horario_acorda || ''} onChange={handlePatientChange} />
                </div>
                <div className="input-group">
                  <label className="input-label">Horário que dorme</label>
                  <input name="horario_dorme" className="input-field" value={formData.horario_dorme || ''} onChange={handlePatientChange} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {mainTab === 'consultas' && (
        <div className="animate-slide-up">
          <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800 }}>
              <TrendingUp size={22} color="var(--primary)" /> Evolução de Peso
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              {consultations.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="peso" stroke="var(--primary)" strokeWidth={3} dot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <div className="empty-state">Sem consultas.</div>}
            </div>
          </div>

          <div className="list-card">
            <div className="list-header"><h3 className="list-title">Histórico de Consultas</h3></div>
            <div className="list-content">
              {consultations.map(c => (
                <div key={c.id} className="list-item">
                  <div className="user-info">
                    <div className="icon-box"><Calendar size={18} /></div>
                    <div>
                      <span className="user-name">{formatDate(c.data_consulta)}</span>
                      <p style={{ fontSize: '0.85rem' }}>Peso: {c.peso}kg | %Gordura: {c.percentual_gordura}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mainTab === 'planos' && (
        <div className="animate-slide-up">
          {isGenerating && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="loader" style={{ margin: '0 auto 1.5rem' }}></div>
              <h3>Gerando Plano com IA...</h3>
            </div>
          )}

          {generatedPlan && !isGenerating && (
            <div className="meal-plan-editor">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 800 }}>📝 Editor de Plano</h3>
                <button className="btn-logout" style={{ width: 'auto' }} onClick={() => setGeneratedPlan(null)}>Cancelar</button>
              </div>
              {generatedPlan.map((dia, dIdx) => (
                <div key={dia.dia} className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 800 }}>📅 {dia.dia}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {Object.entries(dia.refeicoes).map(([mealKey, options]) => (
                      <div key={mealKey} className="meal-card" style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <p style={{ fontWeight: 700, marginBottom: '0.75rem', textTransform: 'capitalize' }}>{mealKey.replace(/_/g, ' ')}</p>
                        {options.map((opt, oIdx) => (
                          <input key={oIdx} className="input-field" style={{ marginBottom: '0.4rem', fontSize: '0.85rem', backgroundColor: 'var(--white)' }} value={opt} onChange={(e) => handleEditMealOption(dIdx, mealKey, oIdx, e.target.value)} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!generatedPlan && !isGenerating && (
            <div className="list-card">
              <div className="list-header"><h3 className="list-title">Histórico de Planos</h3></div>
              <div className="list-content">
                {mealPlans.map(plan => (
                  <div key={plan.id} className="list-item" style={{ cursor: 'pointer' }} onClick={() => setGeneratedPlan(plan.conteudo.plano_semanal)}>
                    <div className="user-info">
                      <div className="icon-box green"><FileText size={18} /></div>
                      <div><span className="user-name">Plano de {new Date(plan.created_at).toLocaleDateString()}</span></div>
                    </div>
                    <button className="btn-icon" style={{ color: 'var(--primary)', fontWeight: 700 }}>Visualizar</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Consultation Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Nova Consulta</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={saveNewConsultation}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="input-group"><label className="input-label">Data</label><input name="data_consulta" type="date" className="input-field" value={newConsultation.data_consulta} onChange={e => setNewConsultation({...newConsultation, data_consulta: e.target.value})} required /></div>
                  <div className="input-group"><label className="input-label">Peso (kg)</label><input name="peso" type="number" step="0.1" className="input-field" value={newConsultation.peso} onChange={e => setNewConsultation({...newConsultation, peso: e.target.value})} required /></div>
                  <div className="input-group"><label className="input-label">% Gordura</label><input name="percentual_gordura" type="number" step="0.1" className="input-field" value={newConsultation.percentual_gordura} onChange={e => setNewConsultation({...newConsultation, percentual_gordura: e.target.value})} /></div>
                  <div className="input-group"><label className="input-label">Próximo Retorno</label><input name="proximo_retorno" type="date" className="input-field" value={newConsultation.proximo_retorno} onChange={e => setNewConsultation({...newConsultation, proximo_retorno: e.target.value})} /></div>
                  <div className="input-group full-width"><label className="input-label">Observações</label><textarea name="observacoes" className="input-field" value={newConsultation.observacoes} onChange={e => setNewConsultation({...newConsultation, observacoes: e.target.value})}></textarea></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary" disabled={saveLoading}>{saveLoading ? 'Salvando...' : 'Salvar Consulta'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .loader { width: 40px; height: 40px; border: 4px solid var(--primary-light); border-bottom-color: var(--primary); border-radius: 50%; animation: rotation 1s linear infinite; }
        @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </Layout>
  );
};

export default PatientProfile;
