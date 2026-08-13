import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Plus, AlertTriangle, Search, Trash2 } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiAvatar } from '../../shared/ui/avatar/avatar';
import { UiButton } from '../../shared/ui/button/button';
import { UiTabs, UiTabItem } from '../../shared/ui/tabs/tabs';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { PregnancyService } from '../../core/services/pregnancy.service';
import { SymptomService } from '../../core/services/symptom.service';
import { MoodService } from '../../core/services/mood.service';
import { WeightService } from '../../core/services/weight.service';
import { DiaryService } from '../../core/services/diary.service';

interface SymptomDef {
  name: string;
  emoji: string;
}

const MOOD_EMOJI: Record<number, string> = { 1: '😢', 2: '🙁', 3: '😐', 4: '🙂', 5: '😄' };

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiCard, UiAvatar, UiButton, UiTabs],
  templateUrl: './tracking.html',
  styleUrl: './tracking.scss'
})
export class Tracking implements OnInit {
  readonly tabs: UiTabItem[] = [
    { id: 'simptomi', label: 'Simptomi' },
    { id: 'raspolozenje', label: 'Raspoloženje' },
    { id: 'tezina', label: 'Težina' },
    { id: 'beleske', label: 'Beleške' },
  ];
  activeTab = 'simptomi';

  readonly symptomCatalog: SymptomDef[] = [
    { name: 'Mučnina', emoji: '🤢' },
    { name: 'Umor', emoji: '😴' },
    { name: 'Bol u leđima', emoji: '🦴' },
    { name: 'Nadutost', emoji: '🌾' },
  ];

  readonly levels = [1, 2, 3] as const;
  readonly moodLevels = [1, 2, 3, 4, 5] as const;
  readonly MOOD_EMOJI = MOOD_EMOJI;

  readonly todayLabel = new Date().toLocaleDateString('sr-RS', { day: 'numeric', month: 'long' });

  moodNote = '';
  weightInput: number | null = null;
  diaryTitle = '';
  diaryContent = '';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    readonly profileSvc: ProfileService,
    private pregnancy: PregnancyService,
    readonly symptomSvc: SymptomService,
    readonly moodSvc: MoodService,
    readonly weightSvc: WeightService,
    readonly diarySvc: DiaryService,
  ) {}

  async ngOnInit() {
    const tabParam = this.route.snapshot.queryParamMap.get('tab');
    if (tabParam && this.tabs.some(t => t.id === tabParam)) this.activeTab = tabParam;

    if (!this.profileSvc.profile()) await this.profileSvc.load();
    const p = this.pregnancy.active();
    if (p) {
      await Promise.all([
        this.symptomSvc.loadToday(p.id),
        this.symptomSvc.loadLastWeek(p.id),
        this.moodSvc.loadToday(p.id),
        this.moodSvc.loadLastWeek(p.id),
        this.weightSvc.loadAll(p.id),
        this.diarySvc.loadAll(p.id),
      ]);
      this.moodNote = this.moodSvc.today()?.note ?? '';
      this.weightInput = this.weightSvc.latest?.weight_kg ?? this.profileSvc.profile()?.weight_kg ?? null;
    }
  }

  levelFor(name: string): number {
    return this.symptomSvc.today().find(e => e.name === name)?.level ?? 0;
  }

  async setLevel(name: string, level: 1 | 2 | 3) {
    const p = this.pregnancy.active();
    if (!p) return;
    await this.symptomSvc.setLevel(p.id, name, level);
  }

  async setMood(mood: 1 | 2 | 3 | 4 | 5) {
    const p = this.pregnancy.active();
    if (!p) return;
    await this.moodSvc.setMood(p.id, mood, this.moodNote);
  }

  async saveWeight() {
    const p = this.pregnancy.active();
    if (!p || !this.weightInput) return;
    await this.weightSvc.logToday(p.id, this.weightInput);
  }

  async saveDiaryEntry() {
    const p = this.pregnancy.active();
    if (!p || !this.diaryTitle.trim() || !this.diaryContent.trim()) return;
    await this.diarySvc.create(p.id, this.diaryTitle.trim(), this.diaryContent.trim());
    this.diaryTitle = '';
    this.diaryContent = '';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' });
  }

  get trendDays(): string[] {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString('sr-RS', { weekday: 'short' }).replace('.', ''));
    }
    return days;
  }

  get trendValues(): number[] {
    const byDate = new Map<string, number[]>();
    for (const e of this.symptomSvc.lastWeek()) {
      const arr = byDate.get(e.logged_date) ?? [];
      arr.push(e.level);
      byDate.set(e.logged_date, arr);
    }
    return this.buildSeries(byDate);
  }

  get moodTrendValues(): number[] {
    const byDate = new Map<string, number[]>();
    for (const e of this.moodSvc.lastWeek()) {
      byDate.set(e.logged_date, [e.mood]);
    }
    return this.buildSeries(byDate);
  }

  private buildSeries(byDate: Map<string, number[]>): number[] {
    const values: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const arr = byDate.get(iso);
      const avg = arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      values.push(avg);
    }
    return values;
  }

  trendPointsFor(values: number[], max: number): string {
    const w = 280, h = 90, pad = 10;
    return values
      .map((v, i) => {
        const x = pad + (i * (w - pad * 2)) / (values.length - 1);
        const y = h - pad - (v / max) * (h - pad * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }

  trendCx(i: number, count: number): number {
    return 10 + (i * 260) / (count - 1);
  }

  trendCy(v: number, max: number): number {
    return 80 - (v / max) * 70;
  }

  async removeDiaryEntry(id: string) {
    await this.diarySvc.remove(id);
  }

  async saveMoodNote() {
    const current = (this.moodSvc.today()?.mood ?? 3) as 1 | 2 | 3 | 4 | 5;
    await this.setMood(current);
  }

  get weightSeries(): { x: number; y: number }[] {
    const entries = this.weightSvc.entries();
    if (entries.length < 2) return [];
    const values = entries.map(e => e.weight_kg);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = 280, h = 90, pad = 10;
    return entries.map((e, i) => ({
      x: pad + (i * (w - pad * 2)) / (entries.length - 1),
      y: h - pad - ((e.weight_kg - min) / range) * (h - pad * 2),
    }));
  }

  get weightPointsStr(): string {
    return this.weightSeries.map(p => `${p.x},${p.y}`).join(' ');
  }

  get diaryEntriesDesc() {
    return this.diarySvc.entries();
  }

  readonly PlusIcon = Plus;
  readonly AlertIcon = AlertTriangle;
  readonly SearchIcon = Search;
  readonly TrashIcon = Trash2;
}
