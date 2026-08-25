import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface MedicationRow {
  id: string;
  pregnancy_id: string;
  name: string;
  type: 'terapija' | 'suplement';
  dose_per_day: number;
  active: boolean;
  created_at: string;
}

export interface MedicationLogRow {
  id: string;
  medication_id: string;
  taken_at: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Jedan dan istorije: šta je tog dana uzeto i koliko puta. */
export interface DanIstorije {
  datum: string;
  stavke: { naziv: string; tip: 'terapija' | 'suplement'; puta: number; ocekivano: number }[];
}

@Injectable({ providedIn: 'root' })
export class MedicationService {
  readonly medications = signal<MedicationRow[]>([]);
  readonly todayLogs = signal<MedicationLogRow[]>([]);
  readonly loading = signal(false);
  readonly istorija = signal<DanIstorije[]>([]);
  readonly istorijaSeUcitava = signal(false);

  constructor(private supabase: SupabaseService) {}

  async loadAll(pregnancyId: string) {
    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('medications')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      .eq('active', true)
      .order('created_at', { ascending: true });

    const meds = (data as MedicationRow[]) ?? [];
    this.medications.set(meds);

    if (meds.length) {
      const start = `${todayIso()}T00:00:00.000Z`;
      const { data: logs } = await this.supabase.client
        .from('medication_logs')
        .select('*')
        .in('medication_id', meds.map(m => m.id))
        .gte('taken_at', start);
      this.todayLogs.set((logs as MedicationLogRow[]) ?? []);
    } else {
      this.todayLogs.set([]);
    }

    this.loading.set(false);
  }

  /**
   * Istorija uzimanja po danima.
   *
   * Uzimaju se i neaktivni lekovi: terapija koja je u međuvremenu prekinuta i
   * dalje je deo istorije, a lekar pita šta je uzimano, ne šta se uzima danas.
   */
  async loadIstorija(pregnancyId: string, danaUnazad = 30) {
    this.istorijaSeUcitava.set(true);

    const { data: meds } = await this.supabase.client
      .from('medications')
      .select('*')
      .eq('pregnancy_id', pregnancyId);

    const sviLekovi = (meds as MedicationRow[]) ?? [];
    if (!sviLekovi.length) {
      this.istorija.set([]);
      this.istorijaSeUcitava.set(false);
      return;
    }

    const od = new Date();
    od.setDate(od.getDate() - danaUnazad);
    od.setHours(0, 0, 0, 0);

    const { data: logs } = await this.supabase.client
      .from('medication_logs')
      .select('*')
      .in('medication_id', sviLekovi.map(m => m.id))
      .gte('taken_at', od.toISOString())
      .order('taken_at', { ascending: false });

    const poDanu = new Map<string, Map<string, number>>();
    for (const l of (logs as MedicationLogRow[]) ?? []) {
      // Datum se čita u lokalnoj zoni: unos u 23h ne sme da padne na sutrašnji dan.
      const d = new Date(l.taken_at);
      const kljuc = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!poDanu.has(kljuc)) poDanu.set(kljuc, new Map());
      const dan = poDanu.get(kljuc)!;
      dan.set(l.medication_id, (dan.get(l.medication_id) ?? 0) + 1);
    }

    const poId = new Map(sviLekovi.map(m => [m.id, m]));
    const dani: DanIstorije[] = [...poDanu.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([datum, stavke]) => ({
        datum,
        stavke: [...stavke.entries()].map(([id, puta]) => {
          const m = poId.get(id);
          return {
            naziv: m?.name ?? 'Nepoznato',
            tip: m?.type ?? 'terapija',
            puta,
            ocekivano: m?.dose_per_day ?? 0,
          };
        }).sort((a, b) => a.naziv.localeCompare(b.naziv, 'sr-Latn-RS')),
      }));

    this.istorija.set(dani);
    this.istorijaSeUcitava.set(false);
  }

  async add(pregnancyId: string, name: string, type: 'terapija' | 'suplement', dosePerDay: number) {
    const { data, error } = await this.supabase.client
      .from('medications')
      .insert({ pregnancy_id: pregnancyId, name, type, dose_per_day: dosePerDay })
      .select()
      .single();
    if (error) throw error;
    this.medications.update(list => [...list, data as MedicationRow]);
    return data as MedicationRow;
  }

  /**
   * Menja postojeći unos umesto brisanja i ponovnog dodavanja — tako se čuva
   * istorija uzimanja, koja visi o istom id-u.
   */
  async update(id: string, patch: { name?: string; type?: 'terapija' | 'suplement'; dose_per_day?: number }) {
    const { data, error } = await this.supabase.client
      .from('medications')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    this.medications.update(list => list.map(m => (m.id === id ? (data as MedicationRow) : m)));
    return data as MedicationRow;
  }

  async remove(id: string) {
    await this.supabase.client.from('medications').update({ active: false }).eq('id', id);
    this.medications.update(list => list.filter(m => m.id !== id));
    this.todayLogs.update(list => list.filter(l => l.medication_id !== id));
  }

  takenCountToday(medicationId: string): number {
    return this.todayLogs().filter(l => l.medication_id === medicationId).length;
  }

  async logDose(medicationId: string) {
    const { data, error } = await this.supabase.client
      .from('medication_logs')
      .insert({ medication_id: medicationId })
      .select()
      .single();
    if (error) throw error;
    this.todayLogs.update(list => [...list, data as MedicationLogRow]);
  }

  async undoDose(medicationId: string) {
    const logs = this.todayLogs().filter(l => l.medication_id === medicationId);
    const last = logs[logs.length - 1];
    if (!last) return;
    await this.supabase.client.from('medication_logs').delete().eq('id', last.id);
    this.todayLogs.update(list => list.filter(l => l.id !== last.id));
  }
}
