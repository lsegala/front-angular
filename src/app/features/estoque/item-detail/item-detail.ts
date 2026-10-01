import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DOCUMENT, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { isAppError } from '../../../core/error-handling/app-error';
import { NotificationService } from '../../../core/error-handling/notification.service';
import { TranslatePipe } from '../../../core/localization/translate.pipe';
import { TranslationService } from '../../../core/localization/translation.service';
import { InventoryItem, isLowStock } from '../data-access/inventory.models';
import { InventoryService } from '../data-access/inventory.service';

@Component({
  selector: 'app-item-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './item-detail.html',
})
export class ItemDetail implements OnInit {
  private readonly inventory = inject(InventoryService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly window = inject(DOCUMENT).defaultView;
  protected readonly translation = inject(TranslationService);
  protected readonly isLowStock = isLowStock;

  /** Parâmetro `:id` da rota. */
  readonly id = input.required<string>();

  protected readonly item = signal<InventoryItem | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly loadFailed = signal(false);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.loadFailed.set(false);
    this.inventory
      .getById(this.id())
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (item) => this.item.set(item),
        // Só 404 é "não encontrado"; as demais falhas já foram notificadas pelo interceptor.
        error: (error: unknown) =>
          isAppError(error) && error.kind === 'not-found'
            ? this.notFound.set(true)
            : this.loadFailed.set(true),
      });
  }

  protected remove(item: InventoryItem): void {
    const message = this.translation.translate('estoque.detail.deleteConfirm', { name: item.name });
    if (!this.window?.confirm(message)) {
      return;
    }
    this.inventory.remove(item.id).subscribe(() => {
      this.notifications.success('estoque.detail.deleted');
      void this.router.navigate(['/estoque']);
    });
  }
}
