## Gamification Design Rules

- **Points**: only additive. Never subtract points; build streak multipliers.  
- **Achievements**: explicit thresholds (e.g., 5-day streak, sharing memes), progressive unlocks.  
- **Leaderboards**: live via WebSockets, fallback to polling if WebSocket fails.  
- **Animations**: max 300 ms ease-in-out transitions for point updates.  
- **UX**: mobile-first interactions, haptics on mobile, click/tap feedback.  
- **Feedback Loops**: always provide visual/audio feedback—must never leave user guessing.
