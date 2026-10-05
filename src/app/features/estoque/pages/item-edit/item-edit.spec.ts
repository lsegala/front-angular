import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { loadTranslations, provideTestEnvironment, typeInto } from '@testing/test-helpers';
import { toAppError } from '@core/error-handling/http-error.mapper';
import { NotificationService } from '@core/error-handling/notification.service';
import { InventoryItem } from '../../data-access/inventory.models';
import { InventoryService } from '../../data-access/inventory.service';
import { ItemEdit } from './item-edit';

const SAVED: InventoryItem = {
  id: '42',
  sku: 'PAP-A4',
  name: 'Papel A4',
  description: '',
  quantity: 10,
  minimumStock: 0,
  unitPrice: 25.5,
  supplierEmail: '',
  updatedAt: '',
};

describe('ItemEdit', () => {
  const inventory = { create: vi.fn(), update: vi.fn(), getById: vi.fn() };

  beforeEach(() => Object.values(inventory).forEach((fn) => fn.mockReset()));

  async function setup(id?: string) {
    TestBed.configureTestingModule({
      providers: [
        provideTestEnvironment(),
        provideRouter([]),
        { provide: InventoryService, useValue: inventory },
      ],
    });
    await loadTranslations();
    const fixture = TestBed.createComponent(ItemEdit);
    if (id) {
      fixture.componentRef.setInput('id', id);
    }
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = (selector: string) => root.querySelector(selector) as HTMLInputElement;
    const submit = async () => {
      root.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    const fillRequired = () => {
      typeInto(input('#item-sku'), 'pap-a4');
      typeInto(input('#item-name'), '  Papel A4 ');
      typeInto(input('#item-quantity'), '10');
      typeInto(input('#item-unit-price'), '25,50');
    };
    return { fixture, root, input, submit, fillRequired };
  }

  it('bloqueia o envio e lista os campos obrigatórios', async () => {
    const { root, submit } = await setup();

    await submit();

    expect(inventory.create).not.toHaveBeenCalled();
    const messages = Array.from(root.querySelectorAll('.error-summary li')).map((li) =>
      li.textContent?.trim(),
    );
    expect(messages).toEqual([
      'Preencha o campo Código (SKU).',
      'Preencha o campo Nome.',
      'Preencha o campo Quantidade.',
      'Preencha o campo Preço unitário (R$).',
    ]);
    expect(root.querySelectorAll('.field--invalid')).toHaveLength(4);
  });

  it('o campo quantidade aceita somente números', async () => {
    const { input } = await setup();

    typeInto(input('#item-quantity'), '12abc');

    expect(input('#item-quantity').value).toBe('12');
  });

  it('cadastra o item normalizando os dados e navega para o detalhe', async () => {
    const { fillRequired, submit } = await setup();
    inventory.create.mockReturnValue(of(SAVED));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fillRequired();
    await submit();

    expect(inventory.create).toHaveBeenCalledWith({
      sku: 'PAP-A4',
      name: 'Papel A4',
      description: '',
      quantity: 10,
      minimumStock: 0,
      unitPrice: 25.5,
      supplierEmail: '',
    });
    expect(TestBed.inject(NotificationService).notifications()[0].messageKey).toBe(
      'estoque.edit.saved',
    );
    expect(navigate).toHaveBeenCalledWith(['/estoque', '42']);
  });

  it('exibe no campo o erro de validação devolvido pelo servidor', async () => {
    const { root, fillRequired, submit } = await setup();
    const serverError = new HttpErrorResponse({
      status: 422,
      error: { errors: { sku: 'estoque.errors.skuTaken' } },
    });
    inventory.create.mockReturnValue(throwError(() => toAppError(serverError)));

    fillRequired();
    await submit();

    expect(root.querySelector('#item-sku-erro')?.textContent).toContain(
      'Já existe um item com este código.',
    );
    expect(root.querySelector('.error-summary')?.textContent).toContain(
      'Já existe um item com este código.',
    );
  });

  it('notifica o erro do servidor quando o campo não existe no formulário', async () => {
    const { root, fillRequired, submit } = await setup();
    const serverError = new HttpErrorResponse({ status: 422, error: { errors: { categoria: 'Inválida' } } });
    inventory.create.mockReturnValue(throwError(() => toAppError(serverError)));

    fillRequired();
    await submit();

    expect(TestBed.inject(NotificationService).notifications()[0].messageKey).toBe('errors.validation');
    expect(root.querySelectorAll('.field--invalid')).toHaveLength(0);
  });

  it('carrega o item existente no modo edição', async () => {
    inventory.getById.mockReturnValue(of(SAVED));
    const { root, input } = await setup('42');

    expect(inventory.getById).toHaveBeenCalledWith('42');
    expect(root.querySelector('h1')?.textContent).toContain('Editar item');
    expect(input('#item-name').value).toBe('Papel A4');
    expect(input('#item-unit-price').value).toBe('25,50');
  });

  it('diferencia falha ao carregar de item inexistente', async () => {
    inventory.getById.mockReturnValue(throwError(() => toAppError(new HttpErrorResponse({ status: 500 }))));
    const { root } = await setup('42');

    expect(root.textContent).toContain('Não foi possível carregar o item.');
    expect(root.textContent).not.toContain('Item não encontrado');
    expect(root.querySelector('form')).toBeNull();
  });
});
