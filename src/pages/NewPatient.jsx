import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Save, User, Activity, Coffee, Check, X } from 'lucide-react';

const NewPatient = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pessoal');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Pessoal
    nome: '',
    data_nascimento: '',
    sexo: '',
    whatsapp: '',
    email: '',
    // Clínico
    peso_inicial: '',
    altura: '',
    objetivos: [],
    objetivo_texto: '',
    nivel_atividade: '',
    patologias: [],
    restricoes_alimentares: [],
    alergias: [],
    medicamentos: '',
    suplementos: '',
    // Hábitos
    refeicoes_por_dia: '',
    horario_acorda: '',
    horario_dorme: '',
    litros_agua: '',
    atividade_fisica: false,
    atividade_fisica_descricao: '',
    observacoes: ''
  });

  // Derived Values
  const [age, setAge] = useState(null);
  const [imc, setImc] = useState(null);

  useEffect(() => {
    if (formData.data_nascimento) {
      const birthDate = new Date(formData.data_nascimento);
      const today = new Date();
      let ageResult = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        ageResult--;
      }
      setAge(ageResult);
    }
  }, [formData.data_nascimento]);

  useEffect(() => {
    if (formData.peso_inicial && formData.altura) {
      const weight = parseFloat(formData.peso_inicial);
      const height = parseFloat(formData.altura) / 100;
      if (height > 0) {
        const imcResult = (weight / (height * height)).toFixed(1);
        setImc(imcResult);
      }
    }
  }, [formData.peso_inicial, formData.altura]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let finalValue = type === 'checkbox' ? checked : value;
    
    if (name === 'whatsapp') {
      finalValue = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (value === 'Nenhum') {
        return { ...prev, [field]: ['Nenhum'] };
      }
      const filtered = current.filter(item => item !== 'Nenhum');
      if (filtered.includes(value)) {
        return { ...prev, [field]: filtered.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...filtered, value] };
      }
    });
  };

  const formatTime = (value) => {
    if (!value) return '';
    const clean = value.replace(/\D/g, '');
    if (clean.length <= 2) return clean.padStart(2, '0') + ':00';
    const hours = clean.slice(0, -2).padStart(2, '0');
    const minutes = clean.slice(-2).padEnd(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatPhone = (value) => {
    if (!value) return '';
    const clean = value.replace(/\D/g, '');
    let formatted = clean;
    
    if (clean.length <= 2) {
      formatted = clean.length > 0 ? `(${clean}` : '';
    } else if (clean.length <= 6) {
      formatted = `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    } else if (clean.length <= 10) {
      formatted = `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    } else {
      formatted = `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
    }
    return formatted;
  };

  const handleTimeBlur = (e) => {
    const { name, value } = e.target;
    const formatted = formatTime(value);
    setFormData(prev => ({ ...prev, [name]: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('pacientes')
        .insert([{
          ...formData,
          nutricionista_id: user.id
        }])
        .select();

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate(`/pacientes/${data[0].id}`);
      }, 1500);
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Erro ao salvar paciente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderTabTrigger = (id, label, TabIcon) => (
    <button
      className={`tab-trigger ${activeTab === id ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
      type="button"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <TabIcon size={18} />
        <span>{label}</span>
      </div>
    </button>
  );

  return (
    <Layout>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Novo Paciente</h1>
          <p className="page-subtitle">Preencha os dados clínicos e hábitos para iniciar o acompanhamento.</p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={loading || !formData.nome}
          className="btn-primary btn-icon"
          style={{ width: 'auto', padding: '0 2rem' }}
        >
          <Save size={20} />
          {loading ? 'Salvando...' : 'Salvar Prontuário'}
        </button>
      </header>

      {success && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '12px', marginBottom: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Check size={20} />
          Paciente cadastrado com sucesso! Redirecionando...
        </div>
      )}

      <div className="tabs-container">
        <div className="tabs-list">
          {renderTabTrigger('pessoal', 'Pessoal', User)}
          {renderTabTrigger('clinico', 'Clínico', Activity)}
          {renderTabTrigger('habitos', 'Hábitos', Coffee)}
        </div>
      </div>

      <div className="form-section">
        {activeTab === 'pessoal' && (
          <div className="form-grid animate-slide-up">
            <div className="input-group full-width">
              <label className="input-label">Nome Completo *</label>
              <input
                name="nome"
                className="input-field"
                placeholder="Ex: Maria Oliveira Silva"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-group">
              <div className="label-row">
                <label className="input-label">Data de Nascimento</label>
                {age !== null && <span className="badge">{age} anos</span>}
              </div>
              <input
                name="data_nascimento"
                type="date"
                className="input-field"
                value={formData.data_nascimento}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Sexo</label>
              <select name="sexo" className="input-field" value={formData.sexo} onChange={handleChange}>
                <option value="">Selecione...</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="input-group full-width">
              <label className="input-label">WhatsApp</label>
              <input
                name="whatsapp"
                className="input-field"
                placeholder="(00) 00000-0000"
                value={formData.whatsapp}
                onChange={handleChange}
                maxLength={15}
              />
            </div>

            <div className="input-group full-width">
              <label className="input-label">E-mail</label>
              <input
                name="email"
                type="email"
                className="input-field"
                placeholder="paciente@exemplo.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {activeTab === 'clinico' && (
          <div className="form-grid animate-slide-up">
            <div className="input-group">
              <label className="input-label">Peso Atual</label>
              <div className="input-with-unit">
                <input
                  name="peso_inicial"
                  type="number"
                  step="0.1"
                  className="input-field"
                  placeholder="0.0"
                  value={formData.peso_inicial}
                  onChange={handleChange}
                />
                <span className="input-unit">kg</span>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Altura</label>
              <div className="input-with-unit">
                <input
                  name="altura"
                  type="number"
                  className="input-field"
                  placeholder="000"
                  value={formData.altura}
                  onChange={handleChange}
                />
                <span className="input-unit">cm</span>
              </div>
            </div>

            <div className="input-group full-width">
              <label className="input-label">IMC (Cálculo Automático)</label>
              <input
                className="input-field readonly-field"
                value={imc || 'Aguardando peso e altura...'}
                readOnly
              />
            </div>

            <div className="input-group full-width">
              <label className="input-label">Objetivos</label>
              <div className="checkbox-group">
                {['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'].map(obj => (
                  <label key={obj} className={`checkbox-item ${formData.objetivos.includes(obj) ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.objetivos.includes(obj)}
                      onChange={() => handleMultiSelect('objetivos', obj)}
                    />
                    {obj}
                  </label>
                ))}
              </div>
              <input
                name="objetivo_texto"
                className="input-field"
                style={{ marginTop: '1rem' }}
                placeholder="Outro objetivo ou informações adicionais..."
                value={formData.objetivo_texto}
                onChange={handleChange}
              />
            </div>

            <div className="input-group full-width">
              <label className="input-label">Nível de Atividade Física</label>
              <select name="nivel_atividade" className="input-field" value={formData.nivel_atividade} onChange={handleChange}>
                <option value="">Selecione...</option>
                <option value="Sedentário">Sedentário</option>
                <option value="Levemente ativo">Levemente ativo</option>
                <option value="Moderadamente ativo">Moderadamente ativo</option>
                <option value="Muito ativo">Muito ativo</option>
                <option value="Extremamente ativo">Extremamente ativo</option>
              </select>
            </div>

            <div className="input-group full-width">
              <label className="input-label">Patologias ou Condições de Saúde</label>
              <div className="checkbox-group">
                {['Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'SOP', 'Doença celíaca', 'Colesterol alto', 'Nenhum'].map(item => (
                  <label key={item} className={`checkbox-item ${formData.patologias.includes(item) ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.patologias.includes(item)}
                      onChange={() => handleMultiSelect('patologias', item)}
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Medicamentos Contínuos</label>
              <textarea
                name="medicamentos"
                className="input-field"
                style={{ minHeight: '100px', resize: 'vertical' }}
                value={formData.medicamentos}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="input-group">
              <label className="input-label">Suplementos em Uso</label>
              <textarea
                name="suplementos"
                className="input-field"
                style={{ minHeight: '100px', resize: 'vertical' }}
                value={formData.suplementos}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        )}

        {activeTab === 'habitos' && (
          <div className="form-grid animate-slide-up">
            <div className="input-group">
              <label className="input-label">Refeições por dia</label>
              <input
                name="refeicoes_por_dia"
                type="number"
                className="input-field"
                value={formData.refeicoes_por_dia}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Consumo de água</label>
              <div className="input-with-unit">
                <input
                  name="litros_agua"
                  type="number"
                  step="0.1"
                  className="input-field"
                  value={formData.litros_agua}
                  onChange={handleChange}
                />
                <span className="input-unit">litros</span>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Horário que acorda</label>
              <input
                name="horario_acorda"
                className="input-field"
                placeholder="Ex: 630"
                value={formData.horario_acorda}
                onChange={handleChange}
                onBlur={handleTimeBlur}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Horário que dorme</label>
              <input
                name="horario_dorme"
                className="input-field"
                placeholder="Ex: 2230"
                value={formData.horario_dorme}
                onChange={handleChange}
                onBlur={handleTimeBlur}
              />
            </div>

            <div className="input-group full-width">
              <label className="input-label clickable-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: '12px' }}>
                <input
                  name="atividade_fisica"
                  type="checkbox"
                  style={{ width: '20px', height: '20px' }}
                  checked={formData.atividade_fisica}
                  onChange={handleChange}
                />
                <span>Pratica atividade física regularmente?</span>
              </label>
            </div>

            {formData.atividade_fisica && (
              <div className="input-group full-width animate-slide-up">
                <label className="input-label">Descreva a atividade e frequência</label>
                <input
                  name="atividade_fisica_descricao"
                  className="input-field"
                  placeholder="Ex: Musculação 4x por semana"
                  value={formData.atividade_fisica_descricao}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="input-group full-width">
              <label className="input-label">Observações Gerais</label>
              <textarea
                name="observacoes"
                className="input-field"
                style={{ minHeight: '120px', resize: 'vertical' }}
                value={formData.observacoes}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewPatient;
