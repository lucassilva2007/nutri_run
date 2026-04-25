import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { User, ArrowLeft, Calendar, FileText, Activity } from 'lucide-react';

const PatientProfile = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/pacientes" className="icon-box" style={{ padding: '0.5rem', backgroundColor: 'var(--white)', border: '1px solid var(--border-light)' }}>
          <ArrowLeft size={20} color="var(--text-main)" />
        </Link>
        <div>
          <h1 className="page-title">{patient?.nome || 'Perfil do Paciente'}</h1>
          <p className="page-subtitle">Visualização detalhada e histórico clínico.</p>
        </div>
      </header>

      {loading ? (
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      ) : patient ? (
        <div className="stats-grid">
          <div className="card">
            <div className="stat-card-header">
              <div className="user-info">
                <div className="user-avatar" style={{ width: '48px', height: '48px' }}>
                  <User size={24} />
                </div>
                <div>
                   <h3 style={{ fontWeight: 800 }}>{patient.nome}</h3>
                   <span className="badge">{patient.email || 'Sem e-mail'}</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>WhatsApp</span>
                  <span style={{ fontWeight: 800 }}>{patient.whatsapp || 'N/A'}</span>
               </div>
            </div>
          </div>

          <div className="card full-width" style={{ gridColumn: 'span 1' }}>
             <h3 style={{ marginBottom: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Activity size={20} color="var(--primary)" />
               Dados Clínicos
             </h3>
             <div className="form-grid">
                <div>
                   <p className="stat-label">Peso Inicial</p>
                   <p style={{ fontWeight: 800, fontSize: '1.25rem' }}>{patient.peso_inicial} kg</p>
                </div>
                <div>
                   <p className="stat-label">Altura</p>
                   <p style={{ fontWeight: 800, fontSize: '1.25rem' }}>{patient.altura} cm</p>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">Paciente não encontrado.</div>
        </div>
      )}
    </Layout>
  );
};

export default PatientProfile;
