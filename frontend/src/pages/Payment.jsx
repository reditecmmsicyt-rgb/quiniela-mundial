import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

const EMPTY = {
  pago_monto:        '',
  pago_fecha_limite: '',
  pago_metodos:      '',
  pago_notas:        '',
};

export default function Payment() {
  const { user }            = useAuth();
  const [data, setData]     = useState(EMPTY);
  const [editing, setEditing] = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings/payment')
      .then(d => { setData(d); setForm(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const updated = await api.put('/settings/payment', form);
      setData(updated);
      setForm(updated);
      setEditing(false);
      setMsg('✅ Información actualizada');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm(data);
    setEditing(false);
    setMsg('');
  }

  const isEmpty = !data.pago_monto && !data.pago_fecha_limite && !data.pago_metodos && !data.pago_notas;

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-green-400 text-xl">Cargando...</div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">💳 Información de Pago</h1>
        {user?.is_admin && !editing && (
          <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
            ✏️ Editar
          </button>
        )}
      </div>

      {msg && (
        <div className="bg-green-900/30 border border-green-700 text-green-300 rounded-lg px-4 py-3 mb-4 text-sm">
          {msg}
        </div>
      )}

      {/* Edit mode (admin only) */}
      {editing ? (
        <form onSubmit={handleSave} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Monto por participante
            </label>
            <input
              className="input"
              placeholder="Ej: $200 MXN"
              value={form.pago_monto}
              onChange={e => setForm(f => ({ ...f, pago_monto: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Fecha límite de pago
            </label>
            <input
              className="input"
              placeholder="Ej: 10 de junio de 2026"
              value={form.pago_fecha_limite}
              onChange={e => setForm(f => ({ ...f, pago_fecha_limite: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Métodos de pago / Datos bancarios
            </label>
            <textarea
              className="input min-h-[120px] resize-y"
              placeholder={`Ej:\nBanco: BBVA\nCuenta: 1234 5678 9012\nCLABE: 012 345 678 901 234 567\nTitular: Juan Pérez\n\nTransferencia OXXO Pay: 5512345678`}
              value={form.pago_metodos}
              onChange={e => setForm(f => ({ ...f, pago_metodos: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notas adicionales
            </label>
            <textarea
              className="input min-h-[80px] resize-y"
              placeholder="Ej: Enviar comprobante por WhatsApp al 55 1234 5678"
              value={form.pago_notas}
              onChange={e => setForm(f => ({ ...f, pago_notas: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={handleCancel} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>

      ) : isEmpty ? (
        /* No info yet */
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">💳</div>
          <p className="text-gray-400">
            {user?.is_admin
              ? 'Aún no hay información de pago. Haz clic en "Editar" para agregarla.'
              : 'El administrador aún no ha publicado la información de pago.'}
          </p>
        </div>

      ) : (
        /* View mode */
        <div className="space-y-4">
          {data.pago_monto && (
            <div className="card flex items-center gap-4">
              <div className="text-3xl">💰</div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Monto por participante</p>
                <p className="text-2xl font-black text-green-400">{data.pago_monto}</p>
              </div>
            </div>
          )}

          {data.pago_fecha_limite && (
            <div className="card flex items-center gap-4">
              <div className="text-3xl">📅</div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Fecha límite de pago</p>
                <p className="text-lg font-semibold text-white">{data.pago_fecha_limite}</p>
              </div>
            </div>
          )}

          {data.pago_metodos && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🏦</span>
                <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  Métodos de pago / Datos bancarios
                </p>
              </div>
              <pre className="text-sm text-gray-100 whitespace-pre-wrap font-sans leading-relaxed bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                {data.pago_metodos}
              </pre>
            </div>
          )}

          {data.pago_notas && (
            <div className="card border-yellow-700/50 bg-yellow-900/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📌</span>
                <p className="text-sm font-semibold text-yellow-400 uppercase tracking-wide">Notas</p>
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {data.pago_notas}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
