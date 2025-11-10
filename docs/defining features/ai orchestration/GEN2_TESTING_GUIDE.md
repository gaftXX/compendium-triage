# AI Orchestra Gen 2 - Testing Guide

## Overview

This guide provides comprehensive testing instructions for the AI Orchestra Gen 2 system.

## Prerequisites

Before testing, ensure:
- Claude API key is set in environment variables
- Firebase is configured and connected
- App is running in development mode
- Test database is set up (see FIREBASE_TEST_DATABASE_SETUP.md)

## Testing Environment

### Start the App

```bash
npm run dev
```

### Access the Cross UI

1. Launch the app
2. Press `Shift+S` to open the Cross UI
3. You should see the GEN1/GEN2 switcher above the input field

### Switch to Gen 2 Mode

1. Click the GEN1/GEN2 switcher, OR
2. Type `switch` or `toggle` and press Enter

Expected response:
```
GEN 2 MODE

AI Orchestra Active

Full app control:
- Create/Update/Delete data
- Query & analyze
- Multi-step workflows
- Context-aware actions
- Note system integration
```

## Test Suite

### Test 1: Simple Navigation

**Command:** `go to regulations`

**Expected:**
1. AI responds with navigation confirmation
2. App navigates to regulations page
3. No action approval required (auto-execute)

**Success Criteria:**
- Navigation happens instantly
- No errors
- App is on regulations page

### Test 2: Database Query (Read-Only)

**Command:** `show me offices in London`

**Expected:**
1. AI thinks for 2-4 seconds
2. Returns list of offices in London
3. No action approval required (auto-execute)

**Success Criteria:**
- Query executes automatically
- Results displayed clearly
- Count matches database

**Variations to Test:**
- `find projects in Barcelona`
- `list regulations for New York`
- `show offices founded after 2000`

### Test 3: Create Office (Requires Approval)

**Command:** `create office called Test Architecture in Barcelona, Spain`

**Expected:**
1. AI thinks for 2-4 seconds
2. **Action approval UI appears** with:
   - Action: `create_office`
   - Badge: "REQUIRES APPROVAL"
   - Input showing: name, city, country
   - Status: PENDING
3. Three buttons: "Approve All & Execute", "Execute Approved", "Cancel"

**Actions to Test:**
- Click "Approve All & Execute" → Office should be created
- Click "Cancel" → No office created, action cancelled
- Approve individual action, then "Execute Approved" → Office created

**Success Criteria:**
- Action approval UI displays correctly
- Office is created only after approval
- Result message shows success
- Office appears in database

### Test 4: Delete Office (Destructive)

**Command:** `delete office Test Architecture`

**Expected:**
1. AI thinks
2. Action approval UI appears with:
   - Action: `delete_office`
   - Badge: "REQUIRES APPROVAL" + "DESTRUCTIVE"
   - Warning visual (red border)
   - Office ID and name shown
3. User must approve

**Success Criteria:**
- Destructive flag is clearly visible
- Visual warning (red indicators)
- Office is deleted only after approval
- Confirmation message displayed

### Test 5: Update Office

**Command:** `update Test Architecture office with website https://testarch.com`

**Expected:**
1. AI may query first to find office ID
2. Action approval UI appears with update action
3. After approval, office is updated
4. Success message shown

**Success Criteria:**
- Office found correctly
- Update requires approval
- Website field updated in database
- Confirmation displayed

### Test 6: Web Search (Requires Approval)

**Command:** `what's the weather in London right now`

**Expected:**
1. AI identifies need for web search
2. Action approval UI appears with:
   - Action: `web_search`
   - Query shown
   - Reason explained
3. After approval, search executes (placeholder in current implementation)

**Success Criteria:**
- AI correctly identifies need for current information
- Approval required before search
- Reason is clear

### Test 7: Multiple Actions

**Command:** `create two offices: one called Office A in Madrid and one called Office B in Paris`

**Expected:**
1. AI thinks
2. Action approval UI shows **2 actions**:
   - create_office (Office A in Madrid)
   - create_office (Office B in Paris)
3. Can approve individually or all at once
4. Both offices created after approval

**Success Criteria:**
- Multiple actions displayed correctly
- Individual approval works
- Approve all works
- Both offices created
- Results for both shown

### Test 8: Multi-Step Workflow

**Command:** `find offices in Barcelona and tell me which has the most projects`

**Expected:**
1. AI thinks
2. May auto-execute query (read-only)
3. Returns analysis of results
4. No approval needed for queries

**Success Criteria:**
- Query executes automatically
- Results analyzed correctly
- Answer is accurate

### Test 9: Note System Activation

**Command:** `Foster + Partners is an architecture office in London with 500 employees`

**Expected:**
1. AI identifies unstructured data
2. Action approval UI shows:
   - Action: `activate_note_system`
   - Text to process shown
3. After approval, note system processes text
4. Office created from extracted data

**Success Criteria:**
- AI recognizes unstructured text
- Asks for approval to activate note system
- Note system extracts data correctly
- Entity created successfully

### Test 10: General Chat

**Command:** `what is GDPR`

**Expected:**
1. AI responds with text explanation
2. No tools used
3. No action approval
4. Direct conversational response

**Success Criteria:**
- No action approval UI
- Clear explanation given
- Fast response

### Test 11: Context Awareness

**Commands (in sequence):**
1. `go to regulations`
2. `what page am I on`

**Expected:**
1. First command navigates
2. Second command uses context to answer "You are on the regulations page"

**Success Criteria:**
- Context is maintained
- AI aware of navigation
- Accurate answer

### Test 12: Error Handling

**Command:** `delete office that doesn't exist`

**Expected:**
1. AI may query first, find no office
2. Returns error message: "Office not found"
3. No action approval UI (can't delete what doesn't exist)

**Success Criteria:**
- Graceful error handling
- Clear error message
- No crash

### Test 13: Cancel Actions

**Command:** `create office Test in London`

**Actions:**
1. Wait for action approval UI
2. Click "Cancel"

**Expected:**
- Action cancelled
- Message: "Actions cancelled"
- No office created

**Success Criteria:**
- Cancel works
- No side effects
- Clear confirmation

### Test 14: Mixed Actions (Some Auto, Some Approval)

**Command:** `show me offices in London and create a new office called New Test in London`

**Expected:**
1. AI creates 2 actions:
   - `query_offices` (auto-execute, no approval)
   - `create_office` (requires approval)
2. Query executes immediately
3. Create office waits for approval
4. Approval UI shows only the create action

**Success Criteria:**
- Query auto-executes
- Create waits for approval
- Results shown for both when complete

## Visual Inspection Checklist

### Action Approval UI
- [ ] Modal appears in correct position
- [ ] Background is semi-transparent black
- [ ] Border is visible and blue
- [ ] Title "Actions to Perform" is bold
- [ ] Action cards have proper styling
- [ ] "REQUIRES APPROVAL" badge is visible on applicable actions
- [ ] "DESTRUCTIVE" badge is visible on destructive actions
- [ ] Status colors are correct (pending=orange, approved=green, rejected=red)
- [ ] Buttons are styled correctly
- [ ] "Approve All & Execute" is green
- [ ] "Execute Approved" is blue
- [ ] "Cancel" is red
- [ ] Scrolling works if many actions
- [ ] Text is readable

### Mode Switcher
- [ ] GEN1/GEN2 switcher visible above input
- [ ] Active mode is at 100% opacity
- [ ] Inactive mode is at 30% opacity
- [ ] Clicking switches modes
- [ ] Mode switch shows confirmation message

## Performance Testing

### Response Times

Test and record response times:

| Action | Expected Time | Actual Time |
|--------|--------------|-------------|
| Intent classification | 1-2s | |
| Simple query | 2-4s | |
| Create action | 3-5s | |
| Multiple actions | 4-6s | |
| Web search | 5-8s | |

### Token Usage

Monitor API costs:
- Check Claude API dashboard
- Verify token usage per request
- Ensure it's within expected range (2,000-3,000 tokens per request)

## Error Scenarios to Test

1. **No API Key**
   - Remove Claude API key
   - Try Gen 2 command
   - Should see: "API key not set" error

2. **Invalid API Key**
   - Set invalid API key
   - Try Gen 2 command
   - Should see: Claude API error

3. **Network Offline**
   - Disconnect internet
   - Try Gen 2 command
   - Should see: Network error

4. **Database Error**
   - Simulate Firestore failure
   - Try database operation
   - Should see: Database error message

5. **Malformed Input**
   - Enter gibberish
   - Should see: General chat response or clarification request

## Regression Testing (Gen 1 Still Works)

Switch back to Gen 1 and verify:
- [ ] Note processing works
- [ ] Navigation patterns work
- [ ] Web search approval works
- [ ] Office scraping works
- [ ] All Gen 1 features intact

## Browser Console Checks

Open browser console and monitor:
- [ ] No unexpected errors
- [ ] Claude API calls logged
- [ ] Tool execution logged
- [ ] Database operations logged
- [ ] No memory leaks

## Database Verification

After testing, check Firebase:
- [ ] Offices created during tests exist
- [ ] Projects created during tests exist
- [ ] Updates persisted correctly
- [ ] Deletes removed documents
- [ ] No orphaned data

## Approval Flow Testing Matrix

| Action Type | Auto-Execute | Requires Approval | Destructive |
|-------------|--------------|-------------------|-------------|
| navigate_to_page | ✓ | ✗ | ✗ |
| open_window | ✓ | ✗ | ✗ |
| query_offices | ✓ | ✗ | ✗ |
| query_projects | ✓ | ✗ | ✗ |
| query_regulations | ✓ | ✗ | ✗ |
| create_office | ✗ | ✓ | ✗ |
| create_project | ✗ | ✓ | ✗ |
| create_regulation | ✗ | ✓ | ✗ |
| update_office | ✗ | ✓ | ✗ |
| delete_office | ✗ | ✓ | ✓ |
| delete_project | ✗ | ✓ | ✓ |
| delete_regulation | ✗ | ✓ | ✓ |
| web_search | ✗ | ✓ | ✗ |
| scrape_google_places | ✗ | ✓ | ✗ |
| activate_note_system | ✗ | ✓ | ✗ |
| create_meditation | ✓ | ✗ | ✗ |
| query_meditations | ✓ | ✗ | ✗ |
| get_current_context | ✓ | ✗ | ✗ |

Test at least one action from each category.

## Bug Reporting

If you find issues, document:
- Command entered
- Expected behavior
- Actual behavior
- Error messages
- Console logs
- Screenshots
- Steps to reproduce

## Test Results Template

```markdown
## Test Session: [Date]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- OS: [macOS/Windows/Linux]
- App Version: [version]

**Test Results:**

### Test 1: Simple Navigation
Status: ✓ Pass / ✗ Fail
Notes: [Any observations]

### Test 2: Database Query
Status: ✓ Pass / ✗ Fail
Notes: [Any observations]

[Continue for all tests...]

**Overall Assessment:**
- Tests Passed: X/14
- Tests Failed: X/14
- Critical Issues: [List]
- Minor Issues: [List]
- Performance: [Good/Fair/Poor]

**Ready for Production:** Yes / No
```

## Success Criteria for Full System

All of these must pass:
- [ ] All 14 basic tests pass
- [ ] No console errors
- [ ] Action approval UI displays correctly
- [ ] All tool categories work
- [ ] Gen 1 still works (no regression)
- [ ] Performance is acceptable (<10s per action)
- [ ] Error handling is graceful
- [ ] Database operations work correctly
- [ ] Visual design matches spec
- [ ] User can cancel actions
- [ ] Destructive actions show warnings

## Next Phase Testing

After basic testing, proceed to:
1. Monitoring Dashboard implementation and testing
2. Learning System implementation and testing
3. Ability Test System implementation and testing

---

Good luck testing! The Gen 2 Orchestra is ready for real-world usage.

