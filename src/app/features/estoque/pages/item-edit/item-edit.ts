import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { isAppError } from '@core/error-handling/app-error';
import { NotificationService } from '@core/error-handling/notification.service';
import { TranslatePipe } from '@core/localization/translate.pipe';
import { EmailField, FormErrorSummary, NumberField, TextField, TextareaField } from '@shared/forms';
import { AppValidators } from '@shared/validation/validators/app-validators';
import { InventoryItemInput } from '../../data-access/inventory.models';
import { InventoryService } from '../../data-access/inventory.service';

/** Cadastro (`/estoque/novo`) e edição (`/estoque/:id/editar`) de itens. */
@Component({
  selector: 'app-item-edit',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    TextField,
    EmailField,
    NumberField,
    TextareaField,
    FormErrorSummary,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './item-edit.html',
})
export class ItemEdit implements OnInit {
  private readonly inventory = inject(InventoryService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);

  /** Parâmetro `:id` da rota; ausente no cadastro. */
  readonly id = input<string>();
  protected readonly isEdit = computed(() => !!this.id());

  protected readonly form = this.fb.group({
    sku: [
      '',
      [
        Validators.required,
        AppValidators.notBlank,
        Validators.maxLength(20),
        AppValidators.pattern(/^[A-Za-z0-9-]+$/, 'estoque.validation.sku'),
      ],
    ],
    name: ['', [Validators.required, AppValidators.notBlank, Validators.maxLength(100)]],
    quantity: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      AppValidators.numeric(),
    ]),
    minimumStock: this.fb.control<number | null>(0, [
      Validators.required,
      Validators.min(0),
      AppValidators.numeric(),
    ]),
    unitPrice: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      AppValidators.numeric({ allowDecimal: true, decimalPlaces: 2 }),
    ]),
    supplierEmail: ['', [AppValidators.email]],
    description: ['', [Validators.maxLength(500)]],
  });

  protected readonly submitAttempt = signal(0);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly notFound = signal(false);
  protected readonly loadFailed = signal(false);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    const id = this.id();
    if (!id) {
      return;
    }
    this.loading.set(true);
    this.notFound.set(false);
    this.loadFailed.set(false);
    this.inventory
      .getById(id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (item) => this.form.patchValue(item),
        // Só 404 é "não encontrado"; as demais falhas já foram notificadas pelo interceptor.
        error: (error: unknown) =>
          isAppError(error) && error.kind === 'not-found'
            ? this.notFound.set(true)
            : this.loadFailed.set(true),
      });
  }

  protected submit(): void {
    this.submitAttempt.update((n) => n + 1);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.toPayload();
    const id = this.id();
    const request$ = id ? this.inventory.update(id, payload) : this.inventory.create(payload);

    this.saving.set(true);
    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (saved) => {
        this.notifications.success('estoque.edit.saved');
        void this.router.navigate(['/estoque', saved.id]);
      },
      error: (error: unknown) => this.applyServerErrors(error),
    });
  }

  /**
   * Erros de validação do backend aparecem no campo correspondente e no resumo.
   * 400/422 não geram notificação global (`handledErrors`), então um erro sem campo
   * correspondente no formulário vira notificação para não se perder.
   */
  private applyServerErrors(error: unknown): void {
    if (!isAppError(error)) {
      return;
    }
    const fieldErrors = Object.entries(error.fieldErrors ?? {});
    let applied = 0;
    for (const [field, message] of fieldErrors) {
      const control = this.form.get(field);
      if (control) {
        control.setErrors({ server: message });
        control.markAsTouched();
        applied++;
      }
    }
    if (applied < fieldErrors.length || applied === 0) {
      this.notifications.error(error.messageKey);
    }
    if (applied > 0) {
      this.submitAttempt.update((n) => n + 1);
    }
  }

  private toPayload(): InventoryItemInput {
    const value = this.form.getRawValue();
    return {
      sku: value.sku.trim().toUpperCase(),
      name: value.name.trim(),
      description: value.description.trim(),
      quantity: value.quantity ?? 0,
      minimumStock: value.minimumStock ?? 0,
      unitPrice: value.unitPrice ?? 0,
      supplierEmail: value.supplierEmail,
    };
  }
}
