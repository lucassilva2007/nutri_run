import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Search, Plus, User, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Patients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Fetch patients and their latest consultation
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          id, 
          nome, 
          objetivos,
          consultas (
            data_consulta
          )
        `)
        .eq('nutricionista_id', user.id)
        .order('nome');

      if (error) throw error;

      // Process to get only the latest consultation date
      const processed = (data || []).map(p => {
        const lastConsultation = p.consultas.sort((a,b) => 
          new Date(b.data_consulta) - new Date(a.data_consulta)
        )[0];
        
        return {
          ...p,
          last_consultation_date: lastConsultation ? lastConsultation.data_consulta : null
        };
      });

      setPatients(processed);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Sem consulta';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <header className="page-header">
        <h1 className="page-title">Meus Pacientes</h1>
        <p className="page-subtitle">Visualize e gerencie todos os seus prontuários.</p>
      </header>

      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="input-field search-input"
            placeholder="Buscar por nome do paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className="btn-primary btn-icon" 
          style={{ width: 'auto', padding: '0 1.5rem' }}
          onClick={() => navigate('/pacientes/novo')}
        >
          <Plus size={20} />
          <span>Novo Paciente</span>
        </button>
      </div>

      {loading ? (
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      ) : filteredPatients.length > 0 ? (
        <div className="list-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Objetivo Principal</th>
                <th>Última Consulta</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => (
                <tr 
                  key={p.id} 
                  className="clickable-row"
                  onClick={() => navigate(`/pacientes/${p.id}`)}
                >
                  <td>
                    <div className="user-info">
                      <div className="user-avatar" style={{ width: '36px', height: '36px' }}>
                        <User size={18} />
                      </div>
                      <span className="user-name">{p.nome}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge-objective">
                      {p.objetivos && p.objetivos.length > 0 ? p.objetivos[0] : 'Não definido'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <Calendar size={14} />
                      {formatDate(p.last_consultation_date)}
                    </div>
                  </td>
                  <td>
                    <ChevronRight size={18} color="var(--text-light)" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            {searchTerm ? 'Nenhum paciente encontrado para esta busca.' : 'Nenhum paciente cadastrado ainda.'}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Patients;
