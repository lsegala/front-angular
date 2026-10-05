import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { loadTranslations, provideTestEnvironment } from '@testing/test-helpers';
import { toAppError } from '@core/error-handling/http-error.mapper';
import { InventoryItem } from '../../data-access/inventory.models';
import { InventoryService } from '../../data-access/inventory.service';
import { ItemDetail } from './item-detail';

const ITEM: InventoryItem = {
  id: '42',
  sku: 'PAP-A4',
  name: 'Papel A4',
  description: '',
  quantity: 10,
  minimumStock: 0,
  unitPrice: 25.5,
  supplierEmail: '',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('ItemDetail', () => {
  const inventory = { getById: vi.fn(), remove: vi.fn() };

  beforeEach(() => Object.values(inventory).forEach((fn) => fn.mockReset()));

  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideTestEnvironment(),
        provideRouter([]),
        { provide: InventoryService, useValue: inventory },
      ],
    });
    await loadTranslations();
    const fixture = TestBed.createComponent(ItemDetail);
    fixture.componentRef.setInput('id', '42');
    await fixture.whenStable();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  }

  it('exibe o item carregado', async () => {
    inventory.getById.mockReturnValue(of(ITEM));
    const { root } = await setup();

    expect(inventory.getById).toHaveBeenCalledWith('42');
    expect(root.querySelector('h1')?.textContent).toContain('Papel A4');
  });

  it('mostra "não encontrado" apenas para 404', async () => {
    inventory.getById.mockReturnValue(
      throwError(() => toAppError(new HttpErrorResponse({ status: 404 }))),
    );
    const { root } = await setup();

    expect(root.textContent).toContain('Item não encontrado');
    expect(root.textContent).not.toContain('Não foi possível carregar o item.');
  });

  it('diferencia falha ao carregar de item inexistente e permite tentar de novo', async () => {
    inventory.getById.mockReturnValue(
      throwError(() => toAppError(new HttpErrorResponse({ status: 500 }))),
    );
    const { fixture, root } = await setup();

    expect(root.textContent).toContain('Não foi possível carregar o item.');
    expect(root.textContent).not.toContain('Item não encontrado');

    inventory.getById.mockReturnValue(of(ITEM));
    root.querySelector<HTMLButtonElement>('.alert button')!.click();
    await fixture.whenStable();

    expect(inventory.getById).toHaveBeenCalledTimes(2);
    expect(root.querySelector('h1')?.textContent).toContain('Papel A4');
  });
});
