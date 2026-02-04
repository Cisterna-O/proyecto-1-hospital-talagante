import { useState, useEffect } from 'react';
import api from '../api/axios';

interface PersonalComboboxProps {
    label: string;
    name: string;
    value: number | undefined;
    onChange: (value: number) => void;
    tipo: 'MEDICO' | 'TM' | 'TP' | 'SECRETARIA' | 'GENERAL';
    required?: boolean;
}

export function PersonalCombobox({
    label,
    name,
    value,
    onChange,
    tipo,
    required = false
}: PersonalComboboxProps) {
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [newValue, setNewValue] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadOptions();
    }, [tipo]);

    const loadOptions = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/catalogos/personal-medico?tipo=${tipo}`);
            setOptions(response.data);
        } catch (err) {
            console.error('Error al cargar personal', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
    
        if (val === 'NEW') {
            setShowInput(true);
        } else {
            onChange(parseInt(val));
            setShowInput(false);
        }
    };

    const handleCreateNew = async () => {
        if (!newValue.trim()) {
            alert('Debe ingresar un nombre');
            return;
        }

        setCreating(true);
        try {
            const response = await api.post('/catalogos/personal-medico', {
                nombre: newValue.trim(),
                tipo: tipo
            });
      
            await loadOptions();
            onChange(response.data.id);
            setNewValue('');
            setShowInput(false);
            alert('Personal agregado exitosamente');
        } catch (err: any) {
            console.error('Error completo:', err.response?.data);
            alert(err.response?.data?.detail || 'Error al crear');
        } finally {
            setCreating(false);
        }
    };

    const handleCancel = () => {
        setShowInput(false);
        setNewValue('');
    };

    return (
        <div>
            <label className="block text-sm font-medium mb-1">
                {label} {required && '*'}
            </label>
      
            {!showInput ? (
                <select
                    name={name}
                    value={value || 0}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required={required}
                    disabled={loading}
                >
                    <option value={0}>{loading ? 'Cargando...' : 'Seleccionar...'}</option>
                    {options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.nombre}</option>
                    ))}
                    <option value="NEW" className="font-bold text-blue-600">
                        ➕ Agregar nuevo...
                    </option>
                </select>
            ) : (
                <div className="space-y-2">
                    <input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder={`Nombre del ${label.toLowerCase()}...`}
                        autoFocus
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateNew();
                            }
                        }}
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleCreateNew}
                            disabled={creating}
                            className="flex-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                        >
                            {creating ? 'Agregando...' : 'Agregar'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 