// LocalStorage persistence utility for QvacStudy sessions and history

const STORAGE_KEY_SESSIONS = 'qvac_study_sessions_v1';
const STORAGE_KEY_ACTIVE_ID = 'qvac_active_session_id_v1';

export function createNewSession(title = 'New Study Session', notes = '', category = 'Custom Notes') {
  return {
    id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    category,
    notes,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export function loadSessions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load study sessions from localStorage:', err);
  }

  // Initial fresh session if no storage exists
  const initial = createNewSession('New Study Session', '', 'Custom Notes');
  saveSessions([initial]);
  return [initial];
}

export function saveSessions(sessions) {
  try {
    if (Array.isArray(sessions)) {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    }
  } catch (err) {
    console.error('Failed to save study sessions to localStorage:', err);
  }
}

export function loadActiveSessionId(sessions = []) {
  try {
    const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (savedId && sessions.some((s) => s.id === savedId)) {
      return savedId;
    }
  } catch (err) {
    console.error('Failed to load active session ID from localStorage:', err);
  }
  return sessions[0]?.id || '';
}

export function saveActiveSessionId(id) {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
    }
  } catch (err) {
    console.error('Failed to save active session ID to localStorage:', err);
  }
}
