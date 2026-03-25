import { reactive } from 'vue'

const LEVEL_COUNT = 12

export const gameStore = reactive({
  screen: 'home', // 'home' | 'levels' | 'game'
  currentLevel: 1,
  scores: JSON.parse(localStorage.getItem('laserScores') || '{}'),

  get totalScore() {
    return Object.values(this.scores).reduce((s, v) => s + v, 0)
  },

  isUnlocked(id) {
    return id === 1 || !!this.scores[id - 1]
  },

  goHome() { this.screen = 'home' },
  goLevels() { this.screen = 'levels' },

  startLevel(id) {
    if (!this.isUnlocked(id)) return
    this.currentLevel = id
    this.screen = 'game'
  },

  saveScore(levelId, score) {
    if (!this.scores[levelId] || score > this.scores[levelId]) {
      this.scores[levelId] = score
      localStorage.setItem('laserScores', JSON.stringify(this.scores))
    }
  },

  resetProgress() {
    this.scores = {}
    localStorage.removeItem('laserScores')
  },

  nextLevel() {
    const next = this.currentLevel + 1
    if (next <= LEVEL_COUNT) this.startLevel(next)
    else this.goLevels()
  },
})
