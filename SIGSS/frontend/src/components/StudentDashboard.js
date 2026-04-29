import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Calendar, FileText, TrendingUp, Clock, Target, 
  AlertCircle, CheckCircle, Bell, Plus, Download, Brain, 
  BarChart3, PieChart, Users, Settings, LogOut
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const StudentDashboard = ({ user, onLogout }) => {
  const [horas, setHoras] = useState(120);
  
  const [actividades, setActividades] = useState([
    { id: 1, fecha: '2026-03-01', desc: 'Taller de capacitación comunitaria', horas: 8, estado: 'Aprobada', proyecto: 'Proyecto Comunitario' },
    { id: 2, fecha: '2026-03-05', desc: 'Apoyo en biblioteca escolar', horas: 12, estado: 'Aprobada', proyecto: 'Apoyo Educativo' },
    { id: 3, fecha: '2026-03-10', desc: 'Limpieza de áreas verdes', horas: 6, estado: 'Pendiente', proyecto: 'Medio Ambiente' },
  ]);
  
  const [notificaciones, setNotificaciones] = useState([
    'Bienvenido al sistema!',
    'Actividad \'Limpieza de áreas verdes\' pendiente de aprobación',
    'Recordatorio: Faltan 360 horas para completar'
  ]);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const mainContentRef = useRef(null);

  // El efecto ascensor ahora funcionará perfecto porque las barras son independientes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const restantes = 480 - horas;
  const progreso = Math.round((horas / 480) * 100);
  const semanasEstimadas = Math.max(1, Math.floor((480 - horas) / 15));

  const weeklyData = [
    { semana: 1, horas: 15 }, { semana: 2, horas: 32 }, { semana: 3, horas: 48 },
    { semana: 4, horas: 65 }, { semana: 5, horas: 82 }, { semana: 6, horas: 98 },
    { semana: 7, horas: 115 }, { semana: 8, horas: 132 }, { semana: 9, horas: 148 },
    { semana: 10, horas: 165 }, { semana: 11, horas: 182 }, { semana: 12, horas: 200 },
  ];

  const handlePrediction = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/predict', {
        horas,
        actividades: actividades.length
      });
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error('Error en predicción:', error);
      const semanas = Math.max(1, Math.floor((480 - horas) / Math.floor(Math.random() * 8 + 10)));
      let riesgo = 'Muy Bajo'; let color = 'success';
      
      if (progreso < 20) { riesgo = 'Crítico'; color = 'danger'; } 
      else if (progreso < 40) { riesgo = 'Alto'; color = 'danger'; } 
      else if (progreso < 60) { riesgo = 'Moderado'; color = 'warning'; } 
      else if (progreso < 80) { riesgo = 'Bajo'; color = 'info'; }
      
      setPrediction({
        semanas, riesgo, color,
        recomendaciones: [
          'Participa en actividades extracurriculares para ganar horas adicionales',
          'Coordina con tu encargado para planificar las próximas actividades',
          'Revisa el calendario de eventos institucionales',
          semanas < 10 ? 'Considera intensificar tu participación' : ''
        ].filter(Boolean)
      });
    } finally {
      setLoading(false);
    }
  };

  const removeNotification = (index) => {
    setNotificaciones(prev => prev.filter((_, i) => i !== index));
  };

  const DashboardHeader = () => (
    <div className="mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
            Panel del Alumno
          </h1>
          <p className="text-gray-600 mt-1">Bienvenido, {user?.name || 'Estudiante'}</p>
        </div>
        <div className="custom-card p-4 text-center">
          <div className="text-primary-600 font-semibold">{new Date().toLocaleDateString('es-ES')}</div>
          <div className="text-sm text-gray-500">Última actualización</div>
        </div>
      </div>
    </div>
  );

  const MetricsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="metric-card">
        <div className="text-3xl font-bold text-primary-600">{horas}</div>
        <div className="text-gray-600 mt-1">Horas Acumuladas</div>
        <div className="progress-bar mt-3"><div className="progress-fill" style={{width: `${progreso}%`}}></div></div>
      </div>
      <div className="metric-card">
        <div className="text-3xl font-bold text-red-500">{restantes}</div>
        <div className="text-gray-600 mt-1">Horas Restantes</div>
      </div>
      <div className="metric-card">
        <div className="text-3xl font-bold text-green-500">{progreso}%</div>
        <div className="text-gray-600 mt-1">Progreso Total</div>
      </div>
      <div className="metric-card">
        <div className="text-3xl font-bold text-yellow-500">{semanasEstimadas}</div>
        <div className="text-gray-600 mt-1">Semanas Estimadas</div>
      </div>
    </div>
  );

  const Notifications = () => (
    <div className="custom-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Bell className="w-5 h-5 mr-2" /> Notificaciones Recientes
      </h3>
      <div className="space-y-3">
        {notificaciones.slice(-3).map((notif, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {notif.includes('aprobada') && <CheckCircle className="w-5 h-5 text-green-500 mr-2" />}
              {notif.includes('registrada') && <FileText className="w-5 h-5 text-blue-500 mr-2" />}
              {!notif.includes('aprobada') && !notif.includes('registrada') && <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />}
              <span className="text-sm">{notif}</span>
            </div>
            <button onClick={() => removeNotification(index)} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
        ))}
      </div>
    </div>
  );

  const ProgressChart = () => (
    <div className="custom-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2" /> Progreso Semanal
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semana" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="horas" fill="url(#colorGradient)" />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1e40af" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const ProgressGauge = () => (
    <div className="custom-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Target className="w-5 h-5 mr-2" /> Estado Actual
      </h3>
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40">
          <svg className="transform -rotate-90 w-40 h-40">
            <circle cx="80" cy="80" r="70" stroke="#e2e8f0" strokeWidth="12" fill="none" />
            <circle
              cx="80" cy="80" r="70" stroke="url(#gradient)" strokeWidth="12" fill="none"
              strokeDasharray={`${(progreso / 100) * 440} 440`} className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-primary-600">{progreso}%</div>
            <div className="text-sm text-gray-500">Completado</div>
          </div>
        </div>
      </div>
    </div>
  );

  const ActivityListTab = () => (
    <div className="custom-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2" /> Mis Actividades Registradas
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 font-semibold text-gray-700">Fecha</th>
              <th className="p-3 font-semibold text-gray-700">Descripción</th>
              <th className="p-3 font-semibold text-gray-700">Proyecto</th>
              <th className="p-3 font-semibold text-gray-700 text-center">Horas</th>
              <th className="p-3 font-semibold text-gray-700 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {actividades.map(act => (
              <tr key={act.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 text-gray-600">{act.fecha}</td>
                <td className="p-3 font-medium text-gray-800">{act.desc}</td>
                <td className="p-3 text-gray-600">{act.proyecto}</td>
                <td className="p-3 text-primary-600 font-semibold text-center">{act.horas} h</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    act.estado === 'Aprobada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {act.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const RegisterActivityTab = () => {
    const [formData, setFormData] = useState({
      desc: '', proyecto: 'Proyecto Comunitario', horas: 8, fecha: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const newActivity = {
        id: actividades.length + 1, ...formData, estado: 'Pendiente', fecha_registro: new Date().toISOString().split('T')[0]
      };
      setActividades([...actividades, newActivity]);
      setNotificaciones([...notificaciones, `Actividad '${formData.desc.substring(0, 30)}...' registrada para revisión`]);
      setFormData({ desc: '', proyecto: 'Proyecto Comunitario', horas: 8, fecha: new Date().toISOString().split('T')[0] });
      
      setActiveTab('actividades');
    };

    return (
      <div className="custom-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center"><Plus className="w-5 h-5 mr-2" />Registrar Nueva Actividad</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de la actividad</label>
              <input type="text" value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="Ej: Taller de capacitación comunitaria" className="w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto asociado</label>
              <select value={formData.proyecto} onChange={(e) => setFormData({...formData, proyecto: e.target.value})} className="w-full">
                <option>Proyecto Comunitario</option>
                <option>Apoyo Educativo</option>
                <option>Salud Pública</option>
                <option>Medio Ambiente</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas dedicadas</label>
              <input type="number" value={formData.horas} onChange={(e) => setFormData({...formData, horas: parseInt(e.target.value)})} min="1" max="40" className="w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de realización</label>
              <input type="date" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} className="w-full" required />
            </div>
          </div>
          <button type="submit" className="btn-primary">Enviar para revisión</button>
        </form>
      </div>
    );
  };

  const IAPredictionTab = () => (
    <div className="custom-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center"><Brain className="w-5 h-5 mr-2" />Análisis Predictivo Inteligente</h3>
      <button onClick={handlePrediction} disabled={loading} className="btn-primary mb-6">
        {loading ? 'Analizando con IA...' : 'Generar Análisis Predictivo'}
      </button>
      {prediction && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="custom-card p-4">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><Clock className="w-4 h-4 mr-2" />Tiempo Estimado</h4>
              <div className="text-2xl font-bold text-primary-600">{prediction.semanas} semanas</div>
              <div className="text-sm text-gray-500">Tiempo estimado para completar las horas</div>
            </div>
            <div className="custom-card p-4">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><AlertCircle className="w-4 h-4 mr-2" />Nivel de Riesgo</h4>
              <div className={`text-2xl font-bold ${
                prediction.color === 'danger' ? 'text-red-500' :
                prediction.color === 'warning' ? 'text-yellow-500' :
                prediction.color === 'info' ? 'text-blue-500' : 'text-green-500'
              }`}>
                {prediction.riesgo}
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Recomendaciones Personalizadas</h4>
            <div className="space-y-2">
              {prediction.recomendaciones.map((rec, index) => (
                <div key={index} className="custom-card p-3"><p className="text-sm">📌 {rec}</p></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const DocumentsTab = () => {
    const documents = [
      { nombre: 'Reglamento de Servicio Social', estado: '📄 Disponible', fecha: '15/01/2026' },
      { nombre: 'Formato de Reporte Mensual', estado: '✅ Completado', fecha: '20/02/2026' },
      { nombre: 'Certificado de Horas Parciales', estado: '⏳ En proceso', fecha: '01/03/2026' },
    ];
    return (
      <div className="custom-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center"><FileText className="w-5 h-5 mr-2" />Gestión Documental</h3>
        <div className="space-y-3">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{doc.nombre}</div>
                <div className="text-sm text-gray-500">{doc.fecha}</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{doc.estado}</span>
                <button className="btn-secondary py-1 px-3 text-sm"><Download className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CalendarTab = () => {
    const eventos = [
      { fecha: '15 Abr', evento: 'Taller de Capacitación', hora: '10:00 AM' },
      { fecha: '20 Abr', evento: 'Revisión de Progreso', hora: '2:00 PM' },
      { fecha: '30 Abr', evento: 'Entrega Final del Sistema', hora: '11:59 PM' },
    ];
    return (
      <div className="custom-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2" />Calendario de Actividades</h3>
        <div className="space-y-3">
          {eventos.map((evento, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="bg-primary-600 text-white px-3 py-2 rounded-lg mr-4">{evento.fecha}</div>
              <div className="flex-1">
                <div className="font-medium">{evento.evento}</div>
                <div className="text-sm text-gray-500">⏰ {evento.hora}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Sidebar = () => (
    // ¡AQUÍ ESTÁ EL PRIMER TRUCO! El menú tiene su propio scroll congelando su tamaño
    <div className="sidebar w-64 h-full overflow-y-auto p-6 flex flex-col">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-800 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl text-white font-bold">{user?.name ? user.name.charAt(0).toUpperCase() : 'E'}</span>
        </div>
        <h3 className="text-white text-lg font-semibold">{user?.name || 'Estudiante'}</h3>
        <p className="text-gray-300 text-sm">{user?.role || 'Alumno'}</p>
      </div>
      
      <div className="space-y-2">
        <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-4 py-2 rounded-lg text-white transition-colors ${activeTab === 'dashboard' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
          📊 Dashboard
        </button>
        <button onClick={() => setActiveTab('actividades')} className={`w-full text-left px-4 py-2 rounded-lg text-white transition-colors ${activeTab === 'actividades' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
          📝 Mis Actividades
        </button>
        <button onClick={() => setActiveTab('ia')} className={`w-full text-left px-4 py-2 rounded-lg text-white transition-colors ${activeTab === 'ia' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
          📈 Progreso e IA
        </button>
        <button onClick={() => setActiveTab('documentos')} className={`w-full text-left px-4 py-2 rounded-lg text-white transition-colors ${activeTab === 'documentos' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
          📄 Documentos
        </button>
        <button onClick={() => setActiveTab('calendario')} className={`w-full text-left px-4 py-2 rounded-lg text-white transition-colors ${activeTab === 'calendario' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
          📅 Calendario
        </button>
      </div>
      
      <div className="mt-8 pt-8 border-t border-gray-600 flex-1">
        <button onClick={() => setActiveTab('registrar')} className={`w-full text-left px-4 py-2 rounded-lg text-white transition-colors mb-2 ${activeTab === 'registrar' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
          ➕ Nueva Actividad
        </button>
        <button onClick={() => setActiveTab('documentos')} className="w-full text-left px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors">
          📄 Generar Constancia
        </button>
      </div>
      
      <div className="mt-8 pt-8 border-t border-gray-600">
        <div className="bg-green-600 text-white px-3 py-2 rounded-lg text-center mb-4">
          🟢 Todo Operativo
        </div>
        <button onClick={onLogout} className="w-full btn-secondary text-left flex items-center">
          <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    // ¡AQUÍ ESTÁ LA ARQUITECTURA MAESTRA! h-screen oculta el scroll del navegador, y cada div hijo tiene su propio overflow
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <Sidebar />
      
      {/* El panel derecho ahora scrollea independiente del menú */}
      <div ref={mainContentRef} className="flex-1 h-full overflow-y-auto p-8 scroll-smooth relative">
        <DashboardHeader />
        
        {activeTab === 'dashboard' && (
          <>
            <Notifications />
            <MetricsCards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2"><ProgressChart /></div>
              <div><ProgressGauge /></div>
            </div>
          </>
        )}
        
        <div>
          {activeTab === 'actividades' && <ActivityListTab />}
          {activeTab === 'registrar' && <RegisterActivityTab />}
          {activeTab === 'ia' && <IAPredictionTab />}
          {activeTab === 'documentos' && <DocumentsTab />}
          {activeTab === 'calendario' && <CalendarTab />}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;