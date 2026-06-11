/**
 * STORAGE.JS – Lokale Datenspeicherung
 * Verwaltet den Spielfortschritt im localStorage.
 */
const Storage = {
    KEY: 'mission_demokratie_v2',

    getProgress() {
        try {
            const saved = localStorage.getItem(this.KEY);
            return saved ? JSON.parse(saved) : this.defaultProgress();
        } catch { return this.defaultProgress(); }
    },

    defaultProgress() {
        return {
            started: false,
            totalPoints: 0,
            totalCorrect: 0,
            totalQuestions: 0,
            unlockedStations: [],
            completedStations: [],
            collectedLetters: {},
            stationProgress: {},
            lastUpdated: Date.now()
        };
    },

    save(progress) {
        progress.lastUpdated = Date.now();
        try { localStorage.setItem(this.KEY, JSON.stringify(progress)); }
        catch (e) { console.warn('Storage full', e); }
    },

    reset() { localStorage.removeItem(this.KEY); },

    unlock(stationId) {
        const p = this.getProgress();
        if (!p.unlockedStations.includes(stationId)) {
            p.unlockedStations.push(stationId);
            this.save(p);
        }
        return p;
    },

    complete(stationId, letter, letterPos, points, correct, total) {
        const p = this.getProgress();
        if (!p.completedStations.includes(stationId)) p.completedStations.push(stationId);
        p.collectedLetters[letterPos] = letter;
        p.totalPoints   += points;
        p.totalCorrect  += correct;
        p.totalQuestions += total;
        p.stationProgress[stationId] = { completed: true, points, correct, total, completedAt: Date.now() };
        this.save(p);
        return p;
    },

    hasProgress() {
        const p = this.getProgress();
        return p.started && (p.unlockedStations.length > 0 || p.completedStations.length > 0);
    },

    markStarted() {
        const p = this.getProgress();
        p.started = true;
        this.save(p);
    }
};