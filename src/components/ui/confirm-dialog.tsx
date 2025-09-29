'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

type InternalState = {
  open: boolean;
  options: ConfirmOptions;
  resolve?: (value: boolean) => void;
};

export function useConfirm() {
  const [state, setState] = useState<InternalState>({
    open: false,
    options: {},
  });

  const confirm = useCallback((options: ConfirmOptions = {}) => {
    return new Promise<boolean>(resolve => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const handleClose = useCallback(() => {
    setState(s => {
      s.resolve?.(false);
      return { open: false, options: {} };
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState(s => {
      s.resolve?.(true);
      return { open: false, options: {} };
    });
  }, []);

  const ConfirmDialog = useMemo(
    () => (
      <Dialog
        open={state.open}
        onOpenChange={open => {
          if (!open) handleClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{state.options.title || 'Are you sure?'}</DialogTitle>
          </DialogHeader>
          {state.options.description ? (
            <div className='text-sm text-muted-foreground'>
              {state.options.description}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant='ghost' onClick={handleClose}>
              {state.options.cancelText || 'Cancel'}
            </Button>
            <Button
              onClick={handleConfirm}
              variant={state.options.destructive ? 'destructive' : 'default'}
            >
              {state.options.confirmText || 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
    [state.open, state.options, handleClose, handleConfirm]
  );

  return { confirm, ConfirmDialog } as const;
}
