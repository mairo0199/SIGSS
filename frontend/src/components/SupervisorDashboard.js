import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, CheckCircle, XCircle, AlertCircle, Mail, 
  FileText, TrendingUp, Clock, Calendar, LogOut 
} from 'lucide-react';

const SupervisorDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const mainContentRef = useRef(null);

  // Efecto ascensor: sube al inicio de la página al cambiar de pestaña
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const [actividades, setActividades] = useState([
    { id: 1, estudiante: 'Ana García', fecha: '2026-03-01', desc: 'Taller de capacitación comunitaria', horas: 8, estado: 'Pendiente', proyecto: 'Proyecto Comunitario' },
    { id: 2, estudiante: 'Juan Pérez', fecha: '2026-03-05', desc: 'Apoyo en biblioteca escolar', horas: 12, estado: 'Pendiente', proyecto: 'Apoyo Educativo' },
    { id: 3, estudiante: 'María Rodríguez', fecha: '2026-03-10', desc: 'Limpieza de áreas verdes', horas: 6, estado: 'Pendiente', proyecto: 'Medio Ambiente' },
  ]);

  const [estudiantes] = useState([
    { nombre: 'Ana García', horas: 320, progreso: 67, estado: 'Activo' },
    { nombre: 'Carlos López', horas: 450, progreso: 94, estado: 'Por terminar' },
    { nombre: 'María Rodríguez', horas: 180, progreso: 38, estado: 'En riesgo' },
    { nombre: 'Juan Pérez', horas: 120, progreso: 25, estado: 'En riesgo' },
  ]);

  const pendientes = actividades.filter(a => a.estado === 'Pendiente');

  const handleApprove = (id) => {
    setActividades(prev => prev.map(a => 
      a.id === id ? { ...a, estado: 'Aprobada' } : a
    ));
  };

  const handleReject = (id) => {
    setActividades(prev => prev.map(a => 
      a.id === id ? { ...a, estado: 'Rechazada' } : a
    ));
  };

  const DashboardHeader = () => (
    <div className="mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
            Panel del Encargado
          </h1>
          <p className="text-gray-600 mt-1">Bienvenido, {user?.name || 'Supervisor'}</p>
        </div>
        <div className="custom-card p-4 text-center">
          <div className="text-primary-600 font-semibold">{new Date().toLocaleDateString('es-ES')}</div>
          <div className="text-sm text-gray-500">Supervisión: <span className="text-blue-500">Activa</span></div>
        </div>
      </div>
    </div>
  );

  const MetricsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="metric-card border-l-4 border-primary-600">
        <div className="text-3xl font-bold text-primary-600">{estudiantes.length}</div>
        <div className="text-gray-600 mt-1">Estudiantes Asignados</div>
      </div>
      <div className="metric-card border-l-4 border-yellow-500">
        <div className="text-3xl font-bold text-yellow-500">{pendientes.length}</div>
        <div className="text-gray-600 mt-1">Pendientes de Validar</div>
      </div>
      <div className="metric-card border-l-4 border-green-500">
        <div className="text-3xl font-bold text-green-500">48</div>
        <div className="text-gray-600 mt-1">Horas Validadas Hoy</div>
      </div>
    </div>
  );

  const PendingActivitiesTab = () => (
    <div className="custom-card">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
        Validación de Actividades
      </h3>
      {pendientes.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500 opacity-20" />
          <p className="text-gray-500 font-medium">No hay solicitudes pendientes por ahora.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendientes.map((act) => (
            <div key={act.id} className="p-5 border border-gray-100 rounded-xl bg-gray-50 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-primary-600 uppercase mb-1 block">{act.estudiante}</span>
                  <h4 className="font-bold text-gray-800 text-lg">{act.desc}</h4>
                  <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {act.fecha}</span>
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {act.horas} horas</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleApprove(act.id)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleReject(act.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const StudentListTab = () => (
    <div className="custom-card">
      <h3 className="text-lg font-semibold mb-6 flex items-center"><Users className="w-5 h-5 mr-2" /> Estudiantes Bajo Supervisión</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 font-semibold text-gray-700">Estudiante</th>
              <th className="p-3 font-semibold text-gray-700 text-center">Horas</th>
              <th className="p-3 font-semibold text-gray-700">Progreso</th>
              <th className="p-3 font-semibold text-gray-700">Estado IA</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((est, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-3 font-medium text-gray-800">{est.nombre}</td>
                <td className="p-3 text-center text-gray-600 font-bold">{est.horas} / 480</td>
                <td className="p-3">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${est.progreso}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-gray-500">{est.progreso}%</span>
                  </div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    est.estado === 'Activo' ? 'bg-green-100 text-green-700' :
                    est.estado === 'Por terminar' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {est.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className="sidebar w-64 h-full overflow-y-auto p-6 flex flex-col">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-800 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl text-white font-bold">{user?.name ? user.name.charAt(0).toUpperCase() : 'S'}</span>
        </div>
        <h3 className="text-white text-lg font-semibold">{user?.name || 'Supervisor'}</h3>
        <p className="text-gray-300 text-sm">Encargado de Proyecto</p>
      </div>
      <div className="space-y-2 flex-1">
        <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-4 py-2 rounded-lg text-white transition-colors ${activeTab === 'dashboard' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
          📊 Dashboard
        </button>
        <button onClick={() => setActiveTab('validaciones')} className={`w-full text-left px-4 py-2 rounded-lg text-white transition-colors ${activeTab === 'validaciones' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
          ✅ Validaciones
        </button>
        <button onClick={() => setActiveTab('estudiantes')} className={`w-full text-left px-4 py-2 rounded-lg text-white transition-colors ${activeTab === 'estudiantes' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
          👥 Estudiantes
        </button>
        <button onClick={() => setActiveTab('reportes')} className={`w-full text-left px-4 py-2 rounded-lg text-white transition-colors ${activeTab === 'reportes' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
          📈 Reportes IA
        </button>
      </div>
      <div className="mt-8 pt-8 border-t border-gray-600">
        <button onClick={onLogout} className="w-full btn-secondary text-left flex items-center">
          <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <Sidebar />
      <div ref={mainContentRef} className="flex-1 h-full overflow-y-auto p-8 scroll-smooth relative">
        <DashboardHeader />
        
        {/* Gráficas y Métricas fijas solo en el Dashboard */}
        {activeTab === 'dashboard' && (
          <>
            <MetricsCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="custom-card">
                <h3 className="font-semibold mb-4 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-primary-600" /> Rendimiento Grupal</h3>
                <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 italic">
                  Gráfica de rendimiento histórico cargando...
                </div>
              </div>
              <div className="custom-card">
                <h3 className="font-semibold mb-4 flex items-center"><Mail className="w-5 h-5 mr-2 text-primary-600" /> Acciones Rápidas</h3>
                <div className="space-y-2">
                  <button className="w-full btn-secondary text-sm py-2">Enviar recordatorio a "En riesgo"</button>
                  <button className="w-full btn-secondary text-sm py-2">Descargar PDF de horas del mes</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Carga dinámica de secciones */}
        <div>
          {activeTab === 'validaciones' && <PendingActivitiesTab />}
          {activeTab === 'estudiantes' && <StudentListTab />}
          {activeTab === 'dashboard' && <PendingActivitiesTab />} {/* Muestra pendientes también en dashboard */}
          {activeTab === 'reportes' && (
            <div className="custom-card">
              <h3 className="font-semibold mb-4">Análisis Predictivo del Grupo</h3>
              <p className="text-gray-500">Este módulo utiliza el motor de Python para identificar qué alumnos no terminarán a tiempo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
