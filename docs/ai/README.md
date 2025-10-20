# AI Coordination Folder

This folder helps AI assistants (Claude, Gemini, etc.) coordinate work on the Life of Pets project.

## File Structure

- **current-state.md** - What's actually implemented right now (updated after completing features)
- **handoff.md** - Active context and next steps for the next AI session
- **decisions.md** - Design decisions and rationale for future reference
- **work-logs/** - Detailed session notes from each AI (optional)

## How to Use

### For AI Assistants

1. **Starting a session**: Read `current-state.md` and `handoff.md` to understand what's done and what's next
2. **During work**: Update `handoff.md` with your progress and blockers
3. **After completing features**: Update `current-state.md` to reflect what's now implemented
4. **Making design decisions**: Document them in `decisions.md` with rationale
5. **Optional**: Add detailed notes to your work-log folder

### For Developers

- Check `current-state.md` to see implementation status
- Read `handoff.md` to understand what the last AI was working on
- Review `decisions.md` to understand why certain approaches were chosen

## Main Project Documentation

The source of truth for specifications is:
- `/docs/ToDo_Documentation.md` - MVP spec with all features, endpoints, and database schemas
- `/docs/Architecture1.png` & `/docs/Architecture2.png` - UI/UX flow diagrams
- `/CLAUDE.md` - Claude Code-specific guidance for this repository
