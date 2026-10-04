import { describe, expect, it, vi } from 'vitest';
const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('./api', () => ({ api: request }));
import { decidePageReview } from './page-review-decision';
const args = { title: 'Synthetic reviewed draft', content: 'Reviewed Markdown.', spaceId: 'synthetic-space' };
describe('explicit human Space review receipt', () => {
  it('checks the existing receipt before writing and sends the reviewed content only after explicit approval', async () => {
    request.mockReset();
    request.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'page', revision: 1, ...args });
    const saved = await decidePageReview('thread', 'manual-review-id', args, true);
    expect(request.mock.calls[0][0]).toContain('/reviewed-page/manual-review-id');
    expect(request.mock.calls[1]).toEqual(['/conversations/thread/reviewed-page', 'POST', { ...args, toolCallId: 'manual-review-id' }]);
    expect(saved?.id).toBe('page');
  });
  it('restores a committed save after an uncertain response without creating a second page', async () => {
    request.mockReset(); request.mockResolvedValue({ id: 'already-saved', revision: 1, ...args });
    expect((await decidePageReview('thread', 'manual-review-id', args, true))?.id).toBe('already-saved');
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('does not write a declined draft or claim a receipt after a failed write', async () => {
    request.mockReset(); request.mockResolvedValueOnce(null);
    expect(await decidePageReview('thread', 'manual-review-id', args, false)).toBeNull();
    expect(request).toHaveBeenCalledTimes(1);
    request.mockReset(); request.mockResolvedValueOnce(null).mockRejectedValueOnce(new Error('Disk full'));
    await expect(decidePageReview('thread', 'manual-review-id', args, true)).rejects.toThrow('Disk full');
  });
});
