import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Pin, EyeOff, MessageSquare, Bookmark, Flag } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { UiBadge } from '../../../shared/ui/badge/badge';
import { UiAvatar } from '../../../shared/ui/avatar/avatar';
import { AuthService } from '../../../core/services/auth.service';
import { ForumService, ForumTopicRow } from '../../../core/services/forum.service';
import { MessagesService } from '../../../core/services/messages.service';
import { ReportService, ReportTarget } from '../../../core/services/report.service';
import { SeoService } from '../../vodic/seo.service';
import { inject } from '@angular/core';
import { TraziKorisnicko } from '../../../shared/trazi-korisnicko/trazi-korisnicko';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [TraziKorisnicko, CommonModule, FormsModule, RouterLink, LucideAngularModule, UiCard, UiButton, UiBadge, UiAvatar],
  templateUrl: './topic-detail.html',
  styleUrl: './topic-detail.scss'
})
export class TopicDetail implements OnInit {
  readonly topic = signal<ForumTopicRow | null>(null);
  readonly loading = signal(true);
  readonly sending = signal(false);
  private seo = inject(SeoService);

  reply = '';
  replyAnonymous = false;

  readonly FlagIcon = Flag;

  /** Sadržaj koji se prijavljuje; prijava traži razlog. */
  readonly reporting = signal<{ type: ReportTarget; id: string } | null>(null);
  reportReason = '';
  readonly reportingBusy = signal(false);

  startReport(type: ReportTarget, id: string) {
    this.reportReason = '';
    this.reporting.set({ type, id });
  }

  cancelReport() {
    this.reporting.set(null);
  }

  async submitReport() {
    const target = this.reporting();
    if (!target || !this.reportReason.trim()) return;

    this.reportingBusy.set(true);
    try {
      await this.reportSvc.report(target.type, target.id, this.reportReason.trim());
      this.reporting.set(null);
    } finally {
      this.reportingBusy.set(false);
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    readonly auth: AuthService,
    readonly forumSvc: ForumService,
    readonly messagesSvc: MessagesService,
    readonly reportSvc: ReportService,
    readonly profileSvc: ProfileService,
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    // Sačuvane teme postoje samo za prijavljene; neulogovanoj taj upit pada.
    const poslovi: Promise<unknown>[] = [this.forumSvc.getTopicById(id), this.forumSvc.loadPosts(id)];
    if (this.auth.user()) {
      poslovi.push(this.forumSvc.loadSavedTopicIds());
      // Bez profila provera korisničkog imena nema šta da pročita, pa bi se
      // prozor otvarao i onima koji ime već imaju.
      if (!this.profileSvc.profile()) poslovi.push(this.profileSvc.load());
    }

    const [topic] = await Promise.all(poslovi);
    this.topic.set(topic as ForumTopicRow | null);
    this.loading.set(false);

    const t = this.topic();
    if (t) {
      // Anonimne teme se ne indeksiraju: žena koja bira anonimnost ne bira i
      // da tekst završi u pretrazi.
      if (t.is_anonymous) {
        this.seo.bezIndeksiranja(t.title);
      } else {
        this.seo.postavi(t.title, (t.body ?? '').slice(0, 155), `/zajednica/tema/${t.id}`);
      }
    }
  }

  /** Vodi na prijavu i pamti temu, da se posle nje vrati tačno ovde. */
  naPrijavu() {
    this.router.navigate(['/login'], { queryParams: { nazad: this.router.url } });
  }

  authorLabel(entry: { is_anonymous: boolean; autor: string | null }): string {
    if (entry.is_anonymous) return 'Anonimna trudnica';
    return entry.autor ?? 'Korisnica';
  }

  isSaved(): boolean {
    const t = this.topic();
    return t ? this.forumSvc.savedTopicIds().has(t.id) : false;
  }

  toggleSave() {
    const t = this.topic();
    if (t) this.forumSvc.toggleSaved(t.id);
  }

  isMyTopic(): boolean {
    // Dolazi iz pogleda: kod anonimnih tema author_id se uopšte ne izdaje,
    // pa se pripadnost ne može utvrditi poređenjem id-jeva.
    return this.topic()?.moja === true;
  }

  /** Anonimnoj autorki se ne može pisati — njen id ne postoji na klijentu. */
  get mozeSePisatiAutoru(): boolean {
    const t = this.topic();
    return !!t && !t.is_anonymous && !!t.author_id && !this.isMyTopic();
  }

  async messageAuthor() {
    const t = this.topic();
    if (!t || !t.author_id || this.isMyTopic()) return;
    const conversationId = await this.messagesSvc.findOrCreateConversation(t.author_id);
    this.router.navigate(['/messages', conversationId]);
  }

  readonly traziKorisnicko = signal(false);
  readonly brisem = signal<string | null>(null);

  /**
   * Uklanja svoj odgovor, uz potvrdu.
   *
   * Potvrda postoji jer je radnja nepovratna, a dugme stoji odmah uz tekst.
   */
  async obrisiOdgovor(id: string) {
    if (!confirm('Da uklonim ovaj odgovor? Ne može da se vrati.')) return;
    this.brisem.set(id);
    try {
      await this.forumSvc.obrisiSvojOdgovor(id);
    } finally {
      this.brisem.set(null);
    }
  }

  async ukloniTemu() {
    const t = this.topic();
    if (!t) return;
    if (!confirm('Da uklonim ovu temu? Ne može da se vrati.')) return;
    await this.forumSvc.ukloniSvojuTemu(t.id);
    this.router.navigateByUrl('/zajednica');
  }

  async korisnickoPostavljeno() {
    this.traziKorisnicko.set(false);
    await this.profileSvc.load();
    await this.submitReply();
  }

  async submitReply() {
    const t = this.topic();
    if (!t || !this.reply.trim()) return;

    // Bez korisničkog imena odgovor ne bi imao čime da se potpiše.
    if (!this.profileSvc.profile()?.username) {
      this.traziKorisnicko.set(true);
      return;
    }
    this.sending.set(true);
    try {
      await this.forumSvc.createPost(t.id, this.reply.trim(), this.replyAnonymous);
      this.reply = '';
    } finally {
      this.sending.set(false);
    }
  }

  timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diffMs / 3_600_000);
    if (hours < 1) return 'upravo sada';
    if (hours < 24) return `pre ${hours}h`;
    const days = Math.floor(hours / 24);
    return `pre ${days}d`;
  }

  readonly BackIcon = ArrowLeft;
  readonly PinIcon = Pin;
  readonly AnonIcon = EyeOff;
  readonly MessageIcon = MessageSquare;
  readonly SaveIcon = Bookmark;
}
