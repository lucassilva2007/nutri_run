import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Users, Calendar, AlertCircle, ChevronRight, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    consultationsThisWeek: 0,
    patientsWithoutReturn: []
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Total Patients
      const { count: patientCount } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('nutricionista_id', user.id);

      // 2. Consultations of the week
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const { count: weekCount } = await supabase
        .from('consultas')
        .select('id, pacientes!inner(id)', { count: 'exact', head: true })
        .eq('pacientes.nutricionista_id', user.id)
        .gte('data_consulta', startOfWeek.toISOString().split('T')[0])
        .lte('data_consulta', endOfWeek.toISOString().split('T')[0]);

      // 3. Patients without return
      const { data: patientsData } = await supabase
        .from('pacientes')
        .select('id, nome, consultas(data_consulta, proximo_retorno)')
        .eq('nutricionista_id', user.id);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const withoutReturn = (patientsData || []).filter(p => {
        if (!p.consultas || p.consultas.length === 0) return false;

        const sortedConsultations = p.consultas.sort((a, b) => 
          new Date(b.data_consulta) - new Date(a.data_consulta)
        );
        
        const lastConsultation = sortedConsultations[0];
        const lastDate = new Date(lastConsultation.data_consulta);
        
        const hasFutureReturn = p.consultas.some(c => 
          c.proximo_retorno && new Date(c.proximo_retorno) >= today
        );

        return lastDate < thirtyDaysAgo && !hasFutureReturn;
      });

      setStats({
        totalPatients: patientCount || 0,
        consultationsThisWeek: weekCount || 0,
        patientsWithoutReturn: withoutReturn
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Bem-vinda, acompanhe o desempenho dos seus atendimentos.</p>
      </header>

      {loading ? (
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="card">
              <div className="stat-card-header">
                <div>
                  <p className="stat-label">Total de pacientes ativos</p>
                  <h3 className="stat-value">{stats.totalPatients}</h3>
                </div>
                <div className="icon-box green">
                  <Users size={28} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="stat-card-header">
                <div>
                  <p className="stat-label">Consultas da semana</p>
                  <h3 className="stat-value">{stats.consultationsThisWeek}</h3>
                </div>
                <div className="icon-box blue">
                  <Calendar size={28} />
                </div>
              </div>
            </div>
          </div>

          <div className="list-card">
            <div className="list-header">
              <div className="list-title-group">
                <div className="icon-box amber" style={{ padding: '0.6rem' }}>
                  <AlertCircle size={20} />
                </div>
                <h3 className="list-title">Pacientes sem retorno</h3>
              </div>
              <span className="badge">
                {stats.patientsWithoutReturn.length} pendentes
              </span>
            </div>

            <div className="list-content">
              {stats.patientsWithoutReturn.length > 0 ? (
                stats.patientsWithoutReturn.map((p) => (
                  <Link key={p.id} to={`/pacientes/${p.id}`} className="list-item">
                    <div className="user-info">
                      <div className="user-avatar">
                        <UserIcon size={20} />
                      </div>
                      <span className="user-name">{p.nome}</span>
                    </div>
                    <ChevronRight size={18} color="var(--text-light)" />
                  </Link>
                ))
              ) : (
                <div className="empty-state">
                  Nenhum paciente sem retorno no momento
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Dashboard;
