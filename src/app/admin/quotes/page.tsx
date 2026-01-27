'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminQuotesPage() {
    const router = useRouter();
    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: 'todos', search: '' });
    const [page, setPage] = useState(1);
    const [selectedQuote, setSelectedQuote] = useState<any>(null); // For Modal

    // Fetch Quotes
    const fetchQuotes = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                status: filters.status,
                search: filters.search
            });
            const res = await fetch(`/api/quotes?${query.toString()}`);
            const data = await res.json();
            setQuotes(data);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotes();
    }, [page, filters]);

    // Handle Status Change
    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            const res = await fetch('/api/quotes', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
            if (res.ok) {
                // Optimistic Update
                setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
                if (selectedQuote && selectedQuote.id === id) {
                    setSelectedQuote({ ...selectedQuote, status: newStatus });
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Helper: WhatsApp Link
    const getWhatsAppLink = (phone: string, name: string, id: number) => {
        if (!phone) return '#';
        const text = `Hola ${name}, te escribo de Viajes Carey respecto a tu cotización #${id}.`;
        return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
    };

    // Helper: Parse Extras
    const parseExtras = (jsonExtras: any) => {
        try {
            if (typeof jsonExtras === 'string') return JSON.parse(jsonExtras);
            return jsonExtras || [];
        } catch (e) { return []; }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 className="text-2xl font-bold mb-6">Panel de Cotizaciones</h1>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
                <input
                    type="text"
                    placeholder="Buscar por cliente o cédula..."
                    className="border p-2 rounded flex-grow"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && fetchQuotes()}
                />
                <select
                    className="border p-2 rounded"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="todos">Todos los Estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="contactado">Contactado</option>
                    <option value="reservado">Reservado</option>
                    <option value="cancelado">Cancelado</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-left font-medium text-gray-500">ID</th>
                            <th className="p-4 text-left font-medium text-gray-500">Fecha</th>
                            <th className="p-4 text-left font-medium text-gray-500">Cliente</th>
                            <th className="p-4 text-left font-medium text-gray-500">Servicio Principal</th>
                            <th className="p-4 text-left font-medium text-gray-500">Total</th>
                            <th className="p-4 text-left font-medium text-gray-500">Estado</th>
                            <th className="p-4 text-left font-medium text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={7} className="p-4 text-center">Cargando...</td></tr>
                        ) : quotes.length === 0 ? (
                            <tr><td colSpan={7} className="p-4 text-center text-gray-500">No hay cotizaciones encontradas.</td></tr>
                        ) : (
                            quotes.map(quote => (
                                <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-900">#{quote.id}</td>
                                    <td className="p-4 text-gray-600">
                                        {new Date(quote.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">
                                            {quote.first_name} {quote.last_name}
                                        </div>
                                        <div className="text-sm text-gray-500">{quote.document_id}</div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {quote.hotel_name || (
                                            parseExtras(quote.extra_services).find((e: any) => e.type === 'tour')?.name || 'Solo Actividades'
                                        )}
                                    </td>
                                    <td className="p-4 font-bold text-green-600">
                                        ${Number(quote.total_price).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${quote.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                quote.status === 'contactado' ? 'bg-blue-100 text-blue-800' :
                                                    quote.status === 'reservado' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {quote.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => setSelectedQuote(quote)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                        >
                                            Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 border rounded disabled:opacity-50 bg-white"
                >
                    Anterior
                </button>
                <span className="text-gray-600">Página {page}</span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={quotes.length < 20}
                    className="px-4 py-2 border rounded disabled:opacity-50 bg-white"
                >
                    Siguiente
                </button>
            </div>

            {/* Modal Detail */}
            {selectedQuote && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold">Detalle Cotización #{selectedQuote.id}</h2>
                            <button onClick={() => setSelectedQuote(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status & Contact */}
                            <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Estado</h3>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                        value={selectedQuote.status}
                                        onChange={(e) => handleStatusChange(selectedQuote.id, e.target.value)}
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="contactado">Contactado</option>
                                        <option value="reservado">Reservado</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Contacto Rápido</h3>
                                    <a
                                        href={getWhatsAppLink(selectedQuote.phone_number || selectedQuote.user_phone, selectedQuote.first_name, selectedQuote.id)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-1 inline-flex items-center justify-center w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                    >
                                        WhatsApp
                                    </a>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <h3 className="text-lg font-bold mb-2">Cliente</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-gray-500 text-sm">Nombre</label>
                                        <p>{selectedQuote.first_name || selectedQuote.user_name} {selectedQuote.last_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-gray-500 text-sm">Documento</label>
                                        <p>{selectedQuote.document_id || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-gray-500 text-sm">Email</label>
                                        <p>{selectedQuote.user_email}</p>
                                    </div>
                                    <div>
                                        <label className="text-gray-500 text-sm">Teléfono</label>
                                        <p>{selectedQuote.phone_number || selectedQuote.user_phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Trip Info */}
                            <div>
                                <h3 className="text-lg font-bold mb-2">Viaje</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-gray-500 text-sm">Huéspedes</label>
                                        <p>{selectedQuote.adults} Adultos, {selectedQuote.children_4_10} Niños, {selectedQuote.children_0_3} Infantes</p>
                                    </div>
                                    {selectedQuote.hotel_id ? (
                                        <>
                                            <div>
                                                <label className="text-gray-500 text-sm">Hotel</label>
                                                <p className="font-semibold text-blue-600">{selectedQuote.hotel_name}</p>
                                            </div>
                                            <div>
                                                <label className="text-gray-500 text-sm">Check-in</label>
                                                <p>{new Date(selectedQuote.check_in).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <label className="text-gray-500 text-sm">Check-out</label>
                                                <p>{new Date(selectedQuote.check_out).toLocaleDateString()}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="col-span-2">
                                            <p className="text-gray-500 italic">Solo Servicios/Tours (Sin Hotel)</p>
                                            {selectedQuote.check_in && (
                                                <p>Fecha: {new Date(selectedQuote.check_in).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Extras List */}
                            <div>
                                <h3 className="text-lg font-bold mb-2">Extras Seleccionados</h3>
                                <ul className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    {parseExtras(selectedQuote.extra_services).length > 0 ? (
                                        parseExtras(selectedQuote.extra_services).map((extra: any, index: number) => (
                                            <li key={index} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                                                <span>{extra.name} <span className="text-gray-400 text-xs">({extra.type})</span></span>
                                                <span className="font-bold">+${extra.price} pp</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-400 italic">Ningún servicio extra seleccionado.</li>
                                    )}
                                </ul>
                            </div>

                            <div className="border-t pt-4 flex justify-between items-center">
                                <span className="text-xl font-bold">Total Cotizado</span>
                                <span className="text-2xl font-bold text-green-600">${Number(selectedQuote.total_price).toLocaleString()}</span>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
