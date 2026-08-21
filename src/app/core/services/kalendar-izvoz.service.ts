import { Injectable } from '@angular/core';
import { AppointmentRow } from './appointment.service';

/**
 * Prebacivanje termina u kalendar telefona.
 *
 * Dva puta, jer nijedan ne radi svuda:
 *   * .ics fajl — standard koji razumeju iOS Kalendar, Google Kalendar i
 *     Outlook. Na telefonu se otvara i nudi „Dodaj u kalendar".
 *   * Google veza — otvara Google Kalendar u pregledaču. Korisna kad preuzimanje
 *     fajla ne prođe, što se na starijim telefonima dešava.
 */
@Injectable({ providedIn: 'root' })
export class KalendarIzvozService {
  /** Trajanje se ne zna, pa se uzima sat vremena — dovoljno da se vidi u dnevnom prikazu. */
  private readonly TRAJANJE_MIN = 60;

  private kraj(pocetak: Date): Date {
    return new Date(pocetak.getTime() + this.TRAJANJE_MIN * 60 * 1000);
  }

  private uUtc(d: Date): string {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /** U .ics vrednosti zarez, tačka-zarez i novi red moraju da se izbegnu. */
  private escape(t: string): string {
    return t.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  private opis(a: AppointmentRow): string {
    return [
      a.subtitle,
      a.doctors ? `Lekar: ${a.doctors.full_name}` : '',
      a.notes ? `Napomena: ${a.notes}` : '',
      'Zakazano preko dnevniktrudnoce.com',
    ].filter(Boolean).join('\n');
  }

  private mesto(a: AppointmentRow): string {
    return a.clinics?.name ?? '';
  }

  ics(a: AppointmentRow): string {
    const pocetak = new Date(a.scheduled_at);
    const opis = this.opis(a);
    const mesto = this.mesto(a);

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'PRODID:-//Dnevnik trudnoce//Pregled//SR',
      'BEGIN:VEVENT',
      `UID:${a.id}@dnevniktrudnoce.com`,
      `DTSTAMP:${this.uUtc(new Date())}`,
      `DTSTART:${this.uUtc(pocetak)}`,
      `DTEND:${this.uUtc(this.kraj(pocetak))}`,
      `SUMMARY:${this.escape(a.title)}`,
      opis ? `DESCRIPTION:${this.escape(opis)}` : '',
      mesto ? `LOCATION:${this.escape(mesto)}` : '',
      // Podsetnik dan ranije: pregled zakazan pre mesec dana se zaboravi, a
      // priprema (nalazi, natašte) traži da se zna veče pre.
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      `DESCRIPTION:${this.escape('Sutra: ' + a.title)}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');
  }

  preuzmi(a: AppointmentRow) {
    const blob = new Blob([this.ics(a)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const veza = document.createElement('a');
    veza.href = url;
    veza.download = `${a.title.replace(/[^\p{L}\p{N} ]/gu, '').trim() || 'pregled'}.ics`;
    document.body.appendChild(veza);
    veza.click();
    veza.remove();
    URL.revokeObjectURL(url);
  }

  /** Google Kalendar traži vreme bez crtica i dvotačaka, u UTC. */
  googleVeza(a: AppointmentRow): string {
    const pocetak = new Date(a.scheduled_at);
    const p = new URLSearchParams({
      action: 'TEMPLATE',
      text: a.title,
      dates: `${this.uUtc(pocetak)}/${this.uUtc(this.kraj(pocetak))}`,
      details: this.opis(a),
    });
    const mesto = this.mesto(a);
    if (mesto) p.set('location', mesto);
    return `https://calendar.google.com/calendar/render?${p.toString()}`;
  }
}
