import { cn } from './cn'

test('cn merges classnames', () => {
  expect(cn('a', false && 'b', 'c')).toBe('a c')
})
