import { NextResponse } from 'next/server';
import { conectarBD } from '@/lib/mongodb';
import { Empresa } from '@/models/Empresa';
import { Cargo } from '@/models/Cargo';
import { Tarifa } from '@/models/Tarifa';
import { Trabajador } from '@/models/Trabajador';

export async function GET() {
  // Este endpoint BORRA y recrea los datos. Nunca en produccion.
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No disponible' }, { status: 403 });
  }

  await conectarBD();

  // Se borra en orden inverso a como se crea
  await Trabajador.deleteMany({});
  await Tarifa.deleteMany({});
  await Cargo.deleteMany({});
  await Empresa.deleteMany({});

  // --- 1. Empresas (no dependen de nada) ---
  const empresas = await Empresa.insertMany([
    { nombre: 'Construcciones Ejemplo S.L.', cif: 'B00000001', activa: true },
    { nombre: 'Reformas Ejemplo S.L.',       cif: 'B00000002', activa: true },
  ]);

  const empresaPrincipal = empresas[0]._id;
  const empresaSecundaria = empresas[1]._id;

  // --- 2. Cargos (no dependen de nada) ---
  const cargos = await Cargo.insertMany([
    { nombre: 'Peón',          orden: 1 },
    { nombre: 'Oficial de 2ª', orden: 2 },
    { nombre: 'Oficial de 1ª', orden: 3 },
    { nombre: 'Encargado',     orden: 4 },
  ]);

  const cargo = (nombre: string) => cargos.find(c => c.nombre === nombre)!._id;

  // --- 3. Tarifas (dependen de los cargos) ---
  await Tarifa.insertMany([
    { cargoId: cargo('Peón'),          precioDia: 78,  vigenteDesde: '2026-01-01' },
    { cargoId: cargo('Oficial de 2ª'), precioDia: 88,  vigenteDesde: '2026-01-01' },
    { cargoId: cargo('Oficial de 1ª'), precioDia: 96,  vigenteDesde: '2026-01-01' },
    { cargoId: cargo('Encargado'),     precioDia: 112, vigenteDesde: '2026-01-01' },
  ]);

  // --- 4. Trabajadores (dependen de cargos y empresas) ---
  // DATOS INVENTADOS. Ver D-011: nada real hasta que exista el login.
  await Trabajador.insertMany([
    { nombre: 'Ana',    apellidos: 'Ruiz Delgado',   dni: '11111111A', cargoId: cargo('Oficial de 1ª'), empresaId: empresaPrincipal,  fechaAlta: '2024-03-01' },
    { nombre: 'Marc',   apellidos: 'Soler Puig',     dni: '22222222B', cargoId: cargo('Peón'),          empresaId: empresaPrincipal,  fechaAlta: '2025-01-15' },
    { nombre: 'Lucía',  apellidos: 'Fernández Mora', dni: '33333333C', cargoId: cargo('Encargado'),     empresaId: empresaPrincipal,  fechaAlta: '2021-09-01' },
    { nombre: 'Javier', apellidos: 'Ortiz Benítez',  dni: '44444444D', cargoId: cargo('Oficial de 2ª'), empresaId: empresaSecundaria, fechaAlta: '2023-06-12' },
    { nombre: 'Rubén',  apellidos: 'Castaño Vega',   dni: '55555555E', cargoId: cargo('Peón'),          empresaId: empresaSecundaria, fechaAlta: '2026-02-03' },
  ]);

  return NextResponse.json({
    ok: true,
    empresas: empresas.length,
    cargos: cargos.length,
    tarifas: 4,
    trabajadores: 5,
  });
}