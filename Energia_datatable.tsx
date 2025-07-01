import React, { useState } from 'react';
import { 
  Calendar, 
  Filter, 
  Search, 
  Download,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

const EnergyDataTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterOpen, setFilterOpen] = useState(false);

  // Dados de exemplo
  const [data, setData] = useState([
    { id: 1, dataInicio: '2024-01-15', dataFim: '2024-03-15', sigla: 'SP-01', fator: 0.85 },
    { id: 2, dataInicio: '2024-02-01', dataFim: '2024-04-01', sigla: 'RJ-02', fator: 0.92 },
    { id: 3, dataInicio: '2024-01-20', dataFim: '2024-03-20', sigla: 'MG-03', fator: 0.78 },
    { id: 4, dataInicio: '2024-03-10', dataFim: '2024-05-10', sigla: 'RS-04', fator: 0.88 },
    { id: 5, dataInicio: '2024-02-15', dataFim: '2024-04-15', sigla: 'PR-05', fator: 0.91 },
    { id: 6, dataInicio: '2024-01-05', dataFim: '2024-03-05', sigla: 'SC-06', fator: 0.83 },
    { id: 7, dataInicio: '2024-03-20', dataFim: '2024-05-20', sigla: 'BA-07', fator: 0.95 },
    { id: 8, dataInicio: '2024-02-28', dataFim: '2024-04-28', sigla: 'CE-08', fator: 0.89 },
    { id: 9, dataInicio: '2024-01-12', dataFim: '2024-03-12', sigla: 'GO-09', fator: 0.76 },
    { id: 10, dataInicio: '2024-03-01', dataFim: '2024-05-01', sigla: 'PE-10', fator: 0.94 }
  ]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getFatorColor = (fator) => {
    if (fator >= 0.9) return 'text-green-400 bg-green-400/20';
    if (fator >= 0.8) return 'text-yellow-400 bg-yellow-400/20';
    return 'text-red-400 bg-red-400/20';
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const filteredData = sortedData.filter(item =>
    item.sigla.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.dataInicio.includes(searchTerm) ||
    item.dataFim.includes(searchTerm) ||
    item.fator.toString().includes(searchTerm)
  );

  const getSortIcon = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'asc' ? 
        <ChevronUp className="w-4 h-4" /> : 
        <ChevronDown className="w-4 h-4" />;
    }
    return <ChevronUp className="w-4 h-4 opacity-0 group-hover:opacity-50" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Dados de <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Energia</span>
          </h1>
          <p className="text-xl text-gray-300">
            Acompanhe os fatores de eficiência energética por período e região
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por sigla, data ou fator..."
                  className="pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-green-400 transition-colors w-full sm:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center space-x-2 px-4 py-3 bg-white/10 border border-white/20 rounded-lg hover:border-white/30 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span>Filtros</span>
              </button>
            </div>

            <div className="flex gap-3">
              {/* Add Button */}
              <button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                <Plus className="w-5 h-5" />
                <span>Adicionar</span>
              </button>

              {/* Export Button */}
              <button className="flex items-center space-x-2 border border-white/30 hover:border-white/50 px-4 py-3 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {filterOpen && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Data Início</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-green-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data Fim</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-green-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fator Mínimo</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    placeholder="0.80"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-green-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('dataInicio')}
                      className="group flex items-center space-x-2 font-semibold text-gray-300 hover:text-white transition-colors"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Data Início</span>
                      {getSortIcon('dataInicio')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('dataFim')}
                      className="group flex items-center space-x-2 font-semibold text-gray-300 hover:text-white transition-colors"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Data Fim</span>
                      {getSortIcon('dataFim')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('sigla')}
                      className="group flex items-center space-x-2 font-semibold text-gray-300 hover:text-white transition-colors"
                    >
                      <span>Sigla</span>
                      {getSortIcon('sigla')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('fator')}
                      className="group flex items-center space-x-2 font-semibold text-gray-300 hover:text-white transition-colors"
                    >
                      <span>Fator</span>
                      {getSortIcon('fator')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="font-semibold text-gray-300">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      index % 2 === 0 ? 'bg-white/2' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300">{formatDate(item.dataInicio)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-300">{formatDate(item.dataFim)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30">
                        {item.sigla}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getFatorColor(item.fator)}`}>
                        {item.fator.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group">
                          <Edit className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group">
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group">
                          <MoreVertical className="w-4 h-4 text-gray-400 group-hover:text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-500/20 to-gray-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Nenhum resultado encontrado</h3>
              <p className="text-gray-400">Tente ajustar os filtros ou termos de busca</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-gray-400">
            Mostrando {filteredData.length} de {data.length} registros
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:border-white/30 transition-colors disabled:opacity-50">
              Anterior
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg font-semibold">
              1
            </button>
            <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:border-white/30 transition-colors">
              2
            </button>
            <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:border-white/30 transition-colors">
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyDataTable;
