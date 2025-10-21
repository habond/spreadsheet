import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useRef } from 'react';
import { useClickOutside } from '../useClickOutside';

// Test component
function TestComponent({ callback }: { callback: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, callback);

  return (
    <div>
      <div ref={ref} data-testid="inside">
        Inside
      </div>
      <div data-testid="outside">Outside</div>
    </div>
  );
}

describe('useClickOutside', () => {
  it('should call callback when clicking outside', async () => {
    const user = userEvent.setup();
    const callback = vi.fn();

    const { getByTestId } = render(<TestComponent callback={callback} />);

    await user.click(getByTestId('outside'));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback when clicking inside', async () => {
    const user = userEvent.setup();
    const callback = vi.fn();

    const { getByTestId } = render(<TestComponent callback={callback} />);

    await user.click(getByTestId('inside'));

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle multiple clicks correctly', async () => {
    const user = userEvent.setup();
    const callback = vi.fn();

    const { getByTestId } = render(<TestComponent callback={callback} />);

    // Click outside multiple times
    await user.click(getByTestId('outside'));
    await user.click(getByTestId('outside'));

    expect(callback).toHaveBeenCalledTimes(2);
  });
});
