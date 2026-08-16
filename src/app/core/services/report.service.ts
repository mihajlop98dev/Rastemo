import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export type ReportTarget = 'topic' | 'post' | 'review' | 'doctor';

@Injectable({ providedIn: 'root' })
export class ReportService {
  /** Id-jevi već prijavljeni u ovoj sesiji, da se dugme ne bi klikalo dvaput. */
  readonly reported = signal<Set<string>>(new Set());

  constructor(private supabase: SupabaseService, private auth: AuthService) {}

  isReported(targetId: string): boolean {
    return this.reported().has(targetId);
  }

  async report(targetType: ReportTarget, targetId: string, reason: string) {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('Not authenticated');

    const { error } = await this.supabase.client.from('reports').insert({
      reporter_id: userId,
      target_type: targetType,
      target_id: targetId,
      reason,
    });

    if (error) throw error;

    this.reported.update(set => new Set(set).add(targetId));
  }
}
