import { useState } from 'react';
import FormularioTAC from '../components/FormularioTAC';
import FormularioRX from '../components/FormularioRX';
import FormularioECO from '../components/FormularioECO';

export default function CrearExamen() {
    const [tipoExamen, setTipoExamen] = useState<'TAC' | 'RX' | 'ECO' | null>(null);
    
    if (!tipoExamen) {
        return (
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Crear Nuevo Examen</h1>
                <div className="bg-white p-6 rounded-lg shadow">
                    <p className="mb-4">Seleccione el tipo de examen:</p>
                    <div className="grid grid-cols-3 gap-4">
                        <button
                            onClick={() => setTipoExamen('TAC')}
                            className="bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700"
                         >
                            TAC
                        </button>
                        <button
                            onClick={() => setTipoExamen('RX')}
                            className="bg-green-600 text-white py-4 rounded-lg hover:bg-green-700"
                        >
                            RX
                        </button>
                        <button
                            onClick={() => setTipoExamen('ECO')}
                            className="bg-purple-600 text-white py-4 rounded-lg hover:bg-purple-700"
                        >
                            ECO
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <button
                onClick={() => setTipoExamen(null)}
                className="mb-4 text-blue-600 hover:underline"
            >
                ← Cambiar tipo de examen
            </button>
            {tipoExamen === 'TAC' && <FormularioTAC />}
            {tipoExamen === 'RX' && <FormularioRX />}
            {tipoExamen === 'ECO' && <FormularioECO />}
        </div>
    );
}