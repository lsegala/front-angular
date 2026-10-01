import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { loadTranslations, provideTestEnvironment } from '../../../../testing/test-helpers';
import { toAppError } from '../../../core/error-handling/http-error.mapper';
import { InventoryItem } from '../data-access/inventory.models';
import { InventoryService } from '../data-access/inventory.service';
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
  updatedAt: '2026-09-20T13:45:00Z',
};

const httpError = (status: number) => throwError(() => toAppError(new HttpErrorResponse({ status })));

describe('ItemDetail', () => {
  const inventory = { getById: vi.fn(), remove: vi.fn() };

  beforeEach(() => Object.values(inventory).forEach((fn) => fn.mockReset()));

  async function setup() {
    TestBed.configureTestingModule({
      providers: [provideTestEnvironment(), provideRouter([]), { provide: InventoryService, useValue: inventory }],
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

  it('informa que o item não existe quando o backend responde 404', async () => {
    inventory.getById.mockReturnValue(httpError(404));
    const { root } = await setup();

    expect(root.textContent).toContain('Item não encontrado');
    expect(root.querySelector('button')).toBeNull();
  });

  it('em outras falhas, informa o erro e permite tentar novamente', async () => {
    inventory.getById.mockReturnValueOnce(httpError(500)).mockReturnValueOnce(of(ITEM));
    const { fixture, root } = await setup();

    expect(root.textContent).toContain('Não foi possível carregar o item.');
    expect(root.textContent).not.toContain('Item não encontrado');

    (root.querySelector('.alert button') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(inventory.getById).toHaveBeenCalledTimes(2);
    expect(root.querySelector('h1')?.textContent).toContain('Papel A4');
  });
});
