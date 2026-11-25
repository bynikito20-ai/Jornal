import { conectarBD } from '@/lib/mongodb';
import { Trabajador } from '@/models/Trabajador';
import { Cargo } from '@/models/Cargo';
import { Empresa } from '@/models/Empresa';

export const dynamic = 'force-dynamic';

type TrabajadorLean = {
  _id: unknown;
  nombre: string;
  apellidos: string;
  dni: string;
  fechaAlta: string;
  cargoId: { nombre: string } | null;
  empresaId: { nombre: string } | null;
};

export default async function PaginaTrabajadores() {
  await conectarBD();

  // Necesario para que populate encuentre los modelos registrados.
  void Cargo;
  void Empresa;

  const docs = await Trabajador.find({ activo: true })
    .populate('cargoId', 'nombre')
    .populate('empresaId', 'nombre')
    .sort({ apellidos: 1 })
    .lean<TrabajadorLean[]>();

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-1 text-2xl font-bold">Trabajadores</h1>
      <p className="mb-6 text-sm text-gray-500">
        {docs.length} activos · datos de prueba
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase text-gray-500">
            <th className="py-2">Nombre</th>
            <th className="py-2">Cargo</th>
            <th className="py-2">Empresa</th>
            <th className="py-2">DNI</th>
            <th className="py-2">Alta</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((t) => (
            <tr key={String(t._id)} className="border-b">
              <td className="py-3">{t.apellidos}, {t.nombre}</td>
              <td className="py-3 text-gray-500">{t.cargoId?.nombre ?? '—'}</td>
              <td className="py-3 text-gray-500">{t.empresaId?.nombre ?? '—'}</td>
              <td className="py-3 font-mono text-xs">{t.dni}</td>
              <td className="py-3 font-mono text-xs">{t.fechaAlta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}