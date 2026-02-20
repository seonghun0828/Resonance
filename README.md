# Responsive Network Builder

A Next.js application that helps early-stage creators discover and engage with posts from accounts likely to meaningfully respond, accelerating authentic network growth.

> See `.claude/CLAUDE.md` for complete product vision and requirements

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Implementation Overview

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + pgvector)
- **Embeddings**: OpenAI API
- **Social Platform**: X (Twitter) API

### Architecture
```
Frontend (Next.js RSC) → API Routes → Services → Database/APIs
                                    ├─ OpenAI API
                                    ├─ Supabase DB
                                    └─ X (Twitter) API
```

---

## Core Features (MVP)

### User Flow
```
Landing Page → Login with X → Dashboard → Write & Submit Replies
```

### 1. Authentication
- **Supabase Auth** with X OAuth 2.0 provider
- Automatic session management (multi-device, token refresh)
- No custom OAuth implementation needed

### 2. Post Discovery & Display
- Fetch recent posts from X API based on keywords
- Rank by engagement likelihood (follower ratio, posting frequency)
- Use OpenAI embeddings for relevance matching
- Display **3-5 recommended posts** with:
  - Post content preview
  - Author info (username, follower count)
  - Engagement signals

### 3. Direct Reply Submission
- User writes reply directly in the app
- Click "Submit Reply" button
- Reply posted to X via API using user's OAuth token
- Success/error feedback displayed
- Engagement tracked in database

### 4. Engagement Likelihood Signals
Simple scoring based on:
- **Follower/Following Ratio**: Accounts following more users are more likely to engage back
- **Posting Frequency**: Active accounts (posts/day in last 7 days)
- **Relevance**: Cosine similarity to user's interests (OpenAI embeddings)

---

## Database Schema (Supabase Auth)

**Supabase Auth provides:**
- `auth.users` - User profiles and OAuth tokens (automatic, encrypted)
- `auth.sessions` - Session management (automatic, multi-device)

**You only need custom tables:**

### engagement_log
```sql
CREATE TABLE engagement_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id VARCHAR NOT NULL,            -- X post ID
  post_author_id VARCHAR NOT NULL,     -- X user ID
  post_content TEXT,
  reply_id VARCHAR,                    -- X reply ID
  reply_text TEXT,
  engagement_score DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### user_interests (Optional - for future enhancement)
```sql
CREATE TABLE user_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_text TEXT NOT NULL,
  embedding VECTOR(1536),              -- OpenAI embedding
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Access user data:**
```typescript
// Get current user
const { data: { session } } = await supabase.auth.getSession();
const userId = session.user.id;

// Get X profile data
const username = session.user.user_metadata.user_name;
const displayName = session.user.user_metadata.name;

// Get X access token for API calls
const xAccessToken = session.provider_token;
```

---

## API Routes

### Authentication
**Handled by Supabase Auth** - No custom auth routes needed
- Login: `supabase.auth.signInWithOAuth({ provider: 'twitter' })`
- Logout: `supabase.auth.signOut()`
- Session: `supabase.auth.getSession()`

---

### GET /api/posts/recommended
Fetch recommended posts for authenticated user

**Authentication**: Supabase session (via cookies, automatic)

**Query Params**:
- `limit` (optional, default: 5)
- `keywords` (optional, comma-separated)

**Response**:
```json
{
  "success": true,
  "data": {
    "posts": [{
      "id": "string",              // X post ID
      "text": "string",
      "authorId": "string",
      "authorUsername": "string",
      "authorName": "string",
      "authorFollowers": 1000,
      "authorFollowing": 500,
      "createdAt": "ISO-8601",
      "engagementScore": 0.85,
      "signals": {
        "postingFrequency": 3.5,   // posts/day
        "followerRatio": 0.5,      // following/followers
        "recentActivity": 10       // posts in last 7 days
      }
    }]
  }
}
```

---

### POST /api/reply/submit
Submit reply to a post on X

**Authentication**: Supabase session (via cookies, automatic)

**Request**:
```json
{
  "postId": "string",
  "replyText": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "replyId": "string",
    "replyUrl": "string"
  }
}
```

---

## Project Structure

```
app/
├── layout.tsx                      # Root layout
├── page.tsx                        # Landing page (Login with X)
├── dashboard/
│   └── page.tsx                    # Main dashboard (protected)
└── api/
    ├── posts/
    │   └── recommended/route.ts    # Fetch & rank posts
    └── reply/
        └── submit/route.ts         # Submit reply to X

components/
├── LoginButton.tsx                 # Supabase Auth login button
├── LogoutButton.tsx                # Supabase Auth logout button
├── PostCard.tsx                    # Post display with signals
├── ReplyInput.tsx                  # Reply text input
└── EngagementSignals.tsx           # Display engagement metrics

lib/
├── services/
│   ├── x-api.service.ts            # X API integration
│   ├── embedding.service.ts        # OpenAI embeddings
│   └── scoring.service.ts          # Response likelihood scoring
├── repositories/
│   └── engagement.repository.ts    # Engagement log CRUD
├── types/
│   └── index.ts                    # TypeScript types
└── utils/
    ├── supabase.ts                 # Supabase client (browser & server)
    └── validation.ts               # Zod schemas

tests/
├── unit/           # Service logic tests
├── integration/    # API route tests
└── e2e/            # User flow tests (login → dashboard → reply)
```

**Note**: No custom auth routes/services needed - Supabase handles everything

---

## Environment Variables

Create `.env.local`:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# OpenAI (Required for embeddings)
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-...

# Node Environment
NODE_ENV=development
```

**What you DON'T need:**
- ❌ X OAuth credentials (configured in Supabase Dashboard)
- ❌ Session secrets (Supabase manages sessions)
- ❌ Encryption keys (Supabase encrypts tokens)
- ❌ Service role key (not needed for MVP)

---

## Development Workflow

### 1. Setup
```bash
pnpm install
# Set up .env.local with required keys
# Create Supabase project and run migrations
```

### 2. Test-Driven Development
Following `.claude/rules/common/testing.md`:
1. Write test first (RED)
2. Implement minimal code (GREEN)
3. Refactor (IMPROVE)
4. Target: 80%+ coverage

### 3. Code Quality
- Immutable data patterns (see `.claude/rules/common/coding-style.md`)
- Input validation at boundaries (Zod schemas)
- Comprehensive error handling
- Small, focused files (<800 lines)

### 4. Security
Before commits (see `.claude/rules/common/security.md`):
- [ ] No hardcoded secrets
- [ ] All inputs validated
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Rate limiting enabled

---

## MVP Success Metrics

### Target Outcomes (Week 2)
- Users discover 3-5 relevant posts per session
- **20%+ "would pay" survey responses**
- Average session time < 5 minutes
- First conversion ($1+)

### Tracked Metrics
```typescript
interface SessionMetrics {
  postsViewed: number;
  postsEngaged: number;
  postsSkipped: number;
  avgResponseLikelihood: number;
  sessionDuration: number;
  feedbackRatings: number[];
}
```

---

## Implementation Phases

### Phase 1: Authentication (Days 1-2)
- [ ] Set up X Developer account & OAuth app
- [ ] Create Supabase project & enable X provider
- [ ] Configure X OAuth in Supabase Dashboard
- [ ] Run database migrations (`engagement_log` table)
- [ ] Implement LoginButton with Supabase Auth
- [ ] Implement protected dashboard route
- [ ] Test login/logout flow

### Phase 2: Dashboard & Post Discovery (Days 3-4)
- [ ] Create dashboard layout
- [ ] Implement X API post fetching
- [ ] Set up OpenAI embeddings service
- [ ] Build post ranking algorithm
- [ ] Create `/api/posts/recommended` endpoint
- [ ] Display posts with engagement signals
- [ ] Add loading & error states
- [ ] Unit tests for ranking logic

### Phase 3: Reply Submission (Days 5-6)
- [ ] Create reply input component
- [ ] Implement `/api/reply/submit` endpoint
- [ ] Submit replies to X via API
- [ ] Add success/error feedback UI
- [ ] Log engagement in database
- [ ] Add character counter (280 limit)
- [ ] Handle API errors gracefully
- [ ] Integration tests for reply flow

### Phase 4: Testing & Polish (Day 7)
- [ ] E2E test: complete user flow
- [ ] Test OAuth edge cases
- [ ] Test rate limiting
- [ ] Verify security measures
- [ ] Deploy to Vercel staging
- [ ] Test production build

### Week 2+: Launch & Iterate
- [ ] Production deployment
- [ ] Monitoring setup (Vercel Analytics)
- [ ] User testing (personal use first)
- [ ] Gather feedback & iterate
- [ ] Early access campaign

---

## Testing

### Test Coverage: 80%+ Required

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

### Key Test Areas
- Embedding cosine similarity
- Response likelihood scoring
- Post filtering logic
- API route handlers
- User flows (onboarding, discovery, interaction)

---

## Cost Estimation (MVP)

- **OpenAI Embeddings**: ~$0.0001/1K tokens
- **X API**: Free tier (check rate limits)
- **Supabase**: Free tier (500MB DB, 2GB bandwidth)
- **Vercel**: Hobby tier free

**Estimated MVP cost**: <$10/month

---

## Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Setup
1. Add all environment variables in Vercel dashboard
2. Enable Vercel Analytics
3. Set up custom domain (optional)
4. Configure Supabase connection pooling for serverless

---

## Next Immediate Steps

> **See `docs/SETUP_AUTH.md` for detailed setup guide**

### 1. Setup Supabase
- [ ] Create new project at https://supabase.com
- [ ] Copy Project URL and Anon Key
- [ ] Go to Authentication → Providers
- [ ] Enable Twitter provider

### 2. Setup X OAuth App
- [ ] Go to https://developer.twitter.com/en/portal/dashboard
- [ ] Create new app, enable OAuth 2.0
- [ ] Copy Client ID & Client Secret
- [ ] Paste into Supabase Twitter provider settings
- [ ] Get Supabase callback URL and add to X app
- [ ] Request scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`

### 3. Configure Environment
```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 4. Run Database Migration
- [ ] Open Supabase SQL Editor
- [ ] Run `lib/db/migrations/001_supabase_auth.sql`
- [ ] Verify `engagement_log` table created

### 5. Install Dependencies
```bash
pnpm add @supabase/supabase-js @supabase/ssr openai twitter-api-v2 zod
```

### 6. Build Core Features (In Order)
1. [ ] Landing page with "Login with X" button (Supabase Auth)
2. [ ] Dashboard page (protected route with session check)
3. [ ] X API service (fetch posts using `provider_token`)
4. [ ] OpenAI embedding service
5. [ ] Post ranking algorithm
6. [ ] `/api/posts/recommended` endpoint
7. [ ] Display posts in dashboard
8. [ ] Reply input component
9. [ ] `/api/reply/submit` endpoint
10. [ ] Test complete flow

### 7. Deploy
- [ ] Deploy to Vercel
- [ ] Add Supabase environment variables
- [ ] Update X callback URL to production Supabase URL
- [ ] Update Supabase Site URL and Redirect URLs
- [ ] Test production flow

---

## Resources

- [Product Requirements](./.claude/CLAUDE.md)
- [Development Rules](./.claude/rules/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [X API v2 Docs](https://developer.twitter.com/en/docs/twitter-api)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
