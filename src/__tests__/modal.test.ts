import { test, describe } from 'node:test';
import assert from 'node:assert';
import type { ConfirmOptions, AlertOptions, ModalVariant } from '../types/index.ts';

describe('Modal & Verification Architecture', () => {
  test('ConfirmOptions supports custom parameters and fallback values', () => {
    const defaultConfirm: ConfirmOptions = {
      message: 'Kaydı silmek istediğinize emin misiniz?',
    };
    assert.strictEqual(defaultConfirm.message, 'Kaydı silmek istediğinize emin misiniz?');
    assert.strictEqual(defaultConfirm.title, undefined);
    assert.strictEqual(defaultConfirm.variant, undefined);

    const customConfirm: ConfirmOptions = {
      title: 'İş Emrini Sil',
      message: 'Kalıcı olarak silinecektir.',
      confirmText: 'Evet, Sil',
      cancelText: 'Vazgeç',
      variant: 'danger',
    };
    assert.strictEqual(customConfirm.title, 'İş Emrini Sil');
    assert.strictEqual(customConfirm.confirmText, 'Evet, Sil');
    assert.strictEqual(customConfirm.cancelText, 'Vazgeç');
    assert.strictEqual(customConfirm.variant, 'danger');
  });

  test('AlertOptions supports warning, info, danger, and success variants', () => {
    const variants: ModalVariant[] = ['danger', 'warning', 'info', 'success'];

    variants.forEach((v) => {
      const alertOpt: AlertOptions = {
        title: `Test ${v}`,
        message: 'Mesaj içeriği',
        variant: v,
        confirmText: 'Tamam',
      };
      assert.strictEqual(alertOpt.variant, v);
      assert.strictEqual(alertOpt.confirmText, 'Tamam');
    });
  });

  test('Preserves multiline strings in verification messages', () => {
    const multiline = '34 ABC 123 plakalı #SRV-100 numaralı iş emrini silmek istediğinize emin misiniz?\n\nNot: Bu iş emrinde kullanılan parçalar stoka iade edilecektir.';
    const options: ConfirmOptions = {
      title: 'İş Emrini Sil',
      message: multiline,
      variant: 'danger',
    };

    assert.ok(options.message.includes('\n\nNot:'));
    assert.strictEqual(options.message.split('\n\n').length, 2);
  });
});
