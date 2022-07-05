import testF from '../src'

test('The calculation result should be 996', () => {
  expect(testF(1024, 28)).toBe(996)
})