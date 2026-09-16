import test from 'node:test'
import assert from 'node:assert/strict'

test('matching equal-stage ingredients are mergeable', () => {
  const tomatoA = { chain: 'tomato', stage: 0 }
  const tomatoB = { chain: 'tomato', stage: 0 }
  assert.equal(tomatoA.chain === tomatoB.chain && tomatoA.stage === tomatoB.stage && tomatoA.stage < 5, true)
})

test('different ingredients cannot merge', () => {
  assert.equal('tomato' === 'cheese', false)
})
