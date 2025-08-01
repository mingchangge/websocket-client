class EventBus {
    static instance;

    constructor() {
        if (EventBus.instance) return EventBus.instance;
        this.listeners = new Map();
        EventBus.instance = this;
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set())
        }
        this.listeners.get(event).add(callback)
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback)
        }
    }

    emit(event, payload) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => cb(payload))
        }
    }
}

export const eventBus = new EventBus()