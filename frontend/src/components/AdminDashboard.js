import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Building2, Settings, FileText, TrendingUp, 
  BarChart3, PieChart, Clock, AlertCircle, LogOut, 
  Plus, Download, Search, Filter 
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart as RePieChart, 
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import axios from 'axios';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const mainContentRef = useRef(null);

  const [usuarios, setUsuarios] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [auditoria, setAuditoria] = useState([]);
  const [metrics, setMetrics] = useState({ usuarios: 0, instituciones: 0, proyectos: 0, horas: 0 });
  const [loading, setLoading] = useState(true);

  // Efecto ascensor automático para cambios de sección
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  // Cargar datos del backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, instRes, auditRes, metricsRes] = await Promise.all([
          axios.get('https://sigss-2.onrender.com/api/admin/usuarios'),
          axios.get('https://sigss-2.onrender.com/api/admin/instituciones'),
          axios.get('https://sigss-2.onrender.com/api/admin/auditoria'),
          axios.get('https://sigss-2.onrender.com/api/admin/metrics')
        ]);
        
        setUsuarios(usersRes.data || []);
        setInstituciones(instRes.data || []);
        setAuditoria(auditRes.data || []);
        setMetrics(metricsRes.data || { usuarios: 0, instituciones: 0, proyectos: 0, horas: 0 });
        
        // Datos de gráficas (se pueden calcular o obtener del backend)
        setRiskData([
          { name: 'Bajo', value: metricsRes.data?.riesgo_bajo || 0, color: '#10b981' },
          { name: 'Moderado', value: metricsRes.data?.riesgo_moderado || 0, color: '#f59e0b' },
          { name: 'Alto', value: metricsRes.data?.riesgo_alto || 0, color: '#ef4444' },
          { name: 'Crítico', value: metricsRes.data?.riesgo_critico || 0, color: '#dc2626' },
        ]);
        
        setTrendData(metricsRes.data?.tendencia || []);
      } catch (error) {
        console.error('Error cargando datos:', error);
        // Valores por defecto si falla la conexión
        setUsuarios([]);
        setInstituciones([]);
        setAuditoria([]);
        setRiskData([]);
        setTrendData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const DashboardHeader = () => (
    <div className="mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-1">Bienvenido, {user?.name || 'Administrador'}</p>
        </div>
        <div className="custom-card p-4 text-center">
          <div className="text-primary-600 font-semibold">{new Date().toLocaleDateString('es-ES')}</div>
          <div className="text-sm text-gray-500">Estado del Sistema: <span className="text-green-500">Óptimo</span></div>
        </div>
      </div>
    </div>
  );

  const AdminMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="metric-card">
        <div className="text-3xl font-bold text-primary-600">{metrics.usuarios}</div>
        <div className="text-gray-600 mt-1">Usuarios Totales</div>
      </div>
      <div className="metric-card">
        <div className="text-3xl font-bold text-blue-600">{metrics.instituciones}</div>
        <div className="text-gray-600 mt-1">Instituciones</div>
      </div>
      <div className="metric-card">
        <div className="text-3xl font-bold text-green-600">{metrics.proyectos}</div>
        <div className="text-gray-600 mt-1">Proyectos Activos</div>
      </div>
      <div className="metric-card">
        <div className="text-3xl font-bold text-purple-600">{metrics.horas.toLocaleString()}</div>
        <div className="text-gray-600 mt-1">Horas Registradas</div>
      </div>
    </div>
  );

  const ChartsSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="custom-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2" /> Riesgo Global (IA)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RePieChart>
            <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {riskData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
            </Pie>
            <Tooltip />
          </RePieChart>
        </ResponsiveContainer>
      </div>
      <div className="custom-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" /> Estudiantes por Mes
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="estudiantes" stroke="#4f46e5" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const UsersTab = () => (
    <div className="custom-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center"><Users className="w-5 h-5 mr-2" /> Usuarios</h3>
        <div className="flex space-x-2">
          <button className="btn-secondary flex items-center" onClick={() => alert('Función de búsqueda disponible cuando se implemente el endpoint de búsqueda')}><Search className="w-4 h-4 mr-2" /> Buscar</button>
          <button className="btn-primary flex items-center" onClick={() => alert('Función de crear usuario disponible cuando se implemente el endpoint de creación')}><Plus className="w-4 h-4 mr-2" /> Nuevo</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 font-semibold text-gray-700">Nombre</th>
              <th className="p-3 font-semibold text-gray-700">Rol</th>
              <th className="p-3 font-semibold text-gray-700">Estado</th>
              <th className="p-3 font-semibold text-gray-700">Último Acceso</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">{u.nombre}</td>
                <td className="p-3 text-gray-600">{u.rol}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.estado}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-500">{u.ultimo_acceso}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const InstitutionsTab = () => (
    <div className="custom-card">
      <h3 className="text-lg font-semibold mb-6 flex items-center"><Building2 className="w-5 h-5 mr-2" /> Instituciones</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {instituciones.map((inst, i) => (
          <div key={i} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
            <div className="font-bold text-gray-800">{inst.nombre}</div>
            <div className="text-sm text-gray-500 mt-1">{inst.estudiantes} Alumnos | {inst.encargados} Supervisores</div>
            <div className="mt-3 text-xs font-bold text-primary-600 uppercase tracking-wider">{inst.estado}</div>
          </div>
        ))}
      </div>
      <form className="p-4 border-2 border-dashed border-gray-200 rounded-xl" onSubmit={async (e) => {
        e.preventDefault();
        const nombre = e.target.elements[0].value;
        const email = e.target.elements[1].value;
        try {
          await axios.post('https://sigss-2.onrender.com/api/admin/instituciones', { nombre, email_contacto: email });
          alert('Institución registrada exitosamente');
          // Recargar instituciones
          const instRes = await axios.get('https://sigss-2.onrender.com/api/admin/instituciones');
          setInstituciones(instRes.data || []);
          e.target.reset();
        } catch (error) {
          console.error('Error registrando institución:', error);
          alert('Error al registrar institución. Por favor intenta nuevamente.');
        }
      }}>
        <h4 className="font-semibold mb-4">Añadir Institución</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Nombre" className="w-full" required />
          <input type="email" placeholder="Email contacto" className="w-full" required />
          <button type="submit" className="btn-primary md:col-span-2">Registrar</button>
        </div>
      </form>
    </div>
  );

  const Sidebar = () => (
    <div className="sidebar w-64 h-full overflow-y-auto p-6 flex flex-col">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-800 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl text-white font-bold">{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
        </div>
        <h3 className="text-white text-lg font-semibold">{user?.name || 'Admin'}</h3>
        <p className="text-gray-300 text-sm">Administrador</p>
      </div>
      <div className="space-y-2 flex-1">
        <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-4 py-2 rounded-lg text-white transition-colors ${activeTab === 'dashboard' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
          📊 Dashboard Global
        </button>
        <button onClick={() => setActiveTab('usuarios')} className={`w-full text-left px-4 py-2 rounded-lg text-white transition-colors ${activeTab === 'usuarios' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
          👥 Usuarios
        </button>
        <button onClick={() => setActiveTab('instituciones')} className={`w-full text-left px-4 py-2 rounded-lg text-white transition-colors ${activeTab === 'instituciones' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
          🏛️ Instituciones
        </button>
        <button onClick={() => setActiveTab('config')} className={`w-full text-left px-4 py-2 rounded-lg text-white transition-colors ${activeTab === 'config' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
          ⚙️ Configuración
        </button>
        <button onClick={() => setActiveTab('auditoria')} className={`w-full text-left px-4 py-2 rounded-lg text-white transition-colors ${activeTab === 'auditoria' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
          🛡️ Auditoría
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
      <div ref={mainContentRef} className="flex-1 h-full overflow-y-auto p-8 scroll-smooth">
        <DashboardHeader />
        {activeTab === 'dashboard' && (
          <>
            <AdminMetrics />
            <ChartsSection />
            <div className="custom-card mb-8">
              <h3 className="font-semibold mb-4 flex items-center"><Clock className="w-5 h-5 mr-2" /> Actividad Reciente</h3>
              <div className="space-y-3">
                {auditoria.map((log, i) => (
                  <div key={i} className="text-sm p-3 bg-gray-50 rounded-lg flex justify-between">
                    <span><strong>{log.usuario}</strong>: {log.accion}</span>
                    <span className="text-gray-400">{log.fecha}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        <div>
          {activeTab === 'usuarios' && <UsersTab />}
          {activeTab === 'instituciones' && <InstitutionsTab />}
          {activeTab === 'config' && <div className="custom-card"><h3>⚙️ Ajustes del Sistema</h3><p className="mt-4 text-gray-500">Módulo de configuración en desarrollo para titulación.</p></div>}
          {activeTab === 'auditoria' && <div className="custom-card"><h3>🛡️ Logs de Seguridad</h3><p className="mt-4 text-gray-500">Aquí se registrarán todos los accesos IP y movimientos de base de datos.</p></div>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;