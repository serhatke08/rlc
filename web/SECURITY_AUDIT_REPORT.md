# Security Audit Report
**Date:** 2025-01-17  
**Project:** Next.js + Supabase Application  
**Scope:** All files in `/app`, `/lib`, `/components`, `/utils`

---

## Executive Summary

This security audit identified **15 security vulnerabilities** across the codebase:
- **2 Critical** issues
- **6 High** severity issues  
- **5 Medium** severity issues
- **2 Low** severity issues

---

## Critical Issues

### 1. Missing Authorization Check in Delete Listing (Client Component)
**File:** `web/src/components/delete-listing-button.tsx`  
**Lines:** 28-31  
**Severity:** CRITICAL

**Issue:**
The delete operation relies solely on client-side checks and RLS policies. There's no server-side verification that the user owns the listing before deletion.

```typescript
const { error } = await (supabase
  .from('listings') as any)
  .update({ status: 'deleted' })
  .eq('id', listingId);
```

**Risk:**
- If RLS policies are misconfigured or bypassed, any user could delete any listing
- Client-side authorization can be manipulated
- No server-side validation

**Fix:**
Move delete operation to a server action or route handler with explicit authorization:
```typescript
// Server action or route handler
const { data: { user } } = await supabase.auth.getUser();
if (!user) return { error: 'Unauthorized' };

const { data: listing } = await supabase
  .from('listings')
  .select('seller_id')
  .eq('id', listingId)
  .single();

if (listing?.seller_id !== user.id) {
  return { error: 'Forbidden' };
}

await supabase
  .from('listings')
  .update({ status: 'deleted' })
  .eq('id', listingId)
  .eq('seller_id', user.id);
```

---

### 2. Missing Authorization Check in Edit Listing (Client Component)
**File:** `web/src/app/edit-listing/[id]/page.tsx`  
**Lines:** 112-129, 327-345  
**Severity:** CRITICAL

**Issue:**
The edit listing page checks ownership client-side (line 125), but the update operation (line 327) only verifies `seller_id` in the WHERE clause. If the client is compromised, ownership could be bypassed.

**Risk:**
- Client-side checks can be bypassed
- Update query uses `.eq('seller_id', user.id)` but doesn't verify listing ownership before allowing edits
- No server-side validation of ownership

**Fix:**
Add server-side verification in a route handler or server action:
```typescript
// Verify ownership before allowing edit
const { data: listing } = await supabase
  .from('listings')
  .select('seller_id')
  .eq('id', listingId)
  .single();

if (!listing || listing.seller_id !== user.id) {
  return { error: 'Forbidden' };
}
```

---

## High Severity Issues

### 3. Direct process.env Usage in Route Handler
**File:** `web/src/app/api/auth/logout/route.ts`  
**Lines:** 9-10  
**Severity:** HIGH

**Issue:**
Direct `process.env` access instead of using the centralized `getEnv()` helper function. This bypasses validation and error handling.

```typescript
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
```

**Risk:**
- No validation if env vars are missing
- Non-null assertion (`!`) can cause runtime errors
- Inconsistent with rest of codebase

**Fix:**
```typescript
import { getEnv } from "@/lib/env";

const supabase = createServerClient(
  getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
```

---

### 4. SQL Injection Risk in Messages Query
**File:** `web/src/app/messages/page.tsx`  
**Line:** 38  
**Severity:** HIGH

**Issue:**
Using string interpolation in `.or()` query which could be vulnerable if user input is not properly sanitized.

```typescript
.or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
```

**Risk:**
- While `user.id` comes from auth, if it's ever derived from user input, this could be exploited
- Supabase PostgREST should sanitize, but best practice is to use parameterized queries

**Fix:**
```typescript
.or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
// Better: Use separate conditions
.or(`user1_id.eq."${user.id}",user2_id.eq."${user.id}"`)
// Or even better: Use .in() if supported
```

**Note:** Supabase client should handle this safely, but explicit parameterization is recommended.

---

### 5. View Count Update Without Authorization Check
**File:** `web/src/app/listing/[id]/page.tsx`  
**Lines:** 126-131  
**Severity:** HIGH

**Issue:**
View count is updated without verifying the user is authenticated or checking for rate limiting. This could be abused to inflate view counts.

```typescript
if (!isOwner) {
  await (supabase
    .from("listings") as any)
    .update({ view_count: (listingData.view_count || 0) + 1 })
    .eq("id", id);
}
```

**Risk:**
- No rate limiting - could be spammed
- No verification that user actually viewed the page
- Could be automated to inflate metrics

**Fix:**
Add rate limiting and verification:
```typescript
// Only update if user is authenticated and hasn't viewed recently
if (!isOwner && user) {
  // Check if user viewed in last 24 hours
  const { data: recentView } = await supabase
    .from('listing_views')
    .select('id')
    .eq('listing_id', id)
    .eq('user_id', user.id)
    .gte('created_at', new Date(Date.now() - 24*60*60*1000).toISOString())
    .single();
  
  if (!recentView) {
    await supabase
      .from("listings")
      .update({ view_count: (listingData.view_count || 0) + 1 })
      .eq("id", id);
  }
}
```

---

### 6. Missing Input Validation in Message Input
**File:** `web/src/components/message-input.tsx`  
**Lines:** 32-37  
**Severity:** HIGH

**Issue:**
Message content is only trimmed but not validated for length, XSS, or malicious content before sending to database.

```typescript
const { error } = await (supabase.rpc as any)("send_message", {
  p_sender_id: user.id,
  p_receiver_id: receiverId,
  p_content: message.trim(),
  p_listing_id: listingId || null,
});
```

**Risk:**
- No length validation (could cause DoS)
- No XSS sanitization (though React should escape on render)
- No content filtering

**Fix:**
```typescript
const sanitizedMessage = message.trim();
if (sanitizedMessage.length === 0) return;
if (sanitizedMessage.length > 5000) {
  alert('Message too long (max 5000 characters)');
  return;
}

// Additional sanitization if needed
const { error } = await (supabase.rpc as any)("send_message", {
  p_sender_id: user.id,
  p_receiver_id: receiverId,
  p_content: sanitizedMessage,
  p_listing_id: listingId || null,
});
```

---

### 7. Potential XSS in dangerouslySetInnerHTML
**File:** `web/src/app/listing/[id]/page.tsx`  
**Lines:** 148-156  
**Severity:** HIGH

**Issue:**
Using `dangerouslySetInnerHTML` with JSON data from database. While JSON.stringify should be safe, if the schema generation function ever includes user-generated content, this could be an XSS vector.

```typescript
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
/>
```

**Risk:**
- If `productSchema` includes unsanitized user content, XSS is possible
- JSON-LD schemas should be validated

**Fix:**
Ensure `generateProductSchema` sanitizes all user-generated fields:
```typescript
// In lib/seo/schema.ts
export async function generateProductSchema(listingId: string) {
  // ... existing code ...
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: escapeHtml(listingData.title), // Sanitize
    description: escapeHtml(listingData.description.substring(0, 500)), // Sanitize and limit
    // ... rest of schema
  };
}
```

**Note:** Current implementation appears safe as it only uses trusted fields, but explicit sanitization is recommended.

---

### 8. Missing Authorization in Sitemap Generation
**File:** `web/src/app/sitemap.ts`  
**Lines:** 61-67  
**Severity:** HIGH

**Issue:**
Sitemap queries all active listings without authentication, which is correct for SEO, but there's no rate limiting or protection against abuse.

**Risk:**
- Could be used to enumerate all listings (though this is public data)
- No rate limiting on sitemap generation
- Could cause performance issues if abused

**Fix:**
Add caching and rate limiting:
```typescript
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Add caching headers
  // Consider using Next.js revalidate for static generation
  // Or implement rate limiting middleware
}
```

**Note:** This is a lower priority as sitemaps are meant to be public, but monitoring is recommended.

---

## Medium Severity Issues

### 9. Overly Permissive Select Queries
**File:** `web/src/app/account/page.tsx`  
**Line:** 42  
**Severity:** MEDIUM

**Issue:**
Using `select("*")` which returns all columns including potentially sensitive fields.

```typescript
const { data: listings, error: listingsError } = await supabase
  .from("listings")
  .select("*")
  .eq("seller_id", user.id)
```

**Risk:**
- Returns all columns, including internal metadata
- Could expose sensitive fields if schema changes
- Best practice is to select only needed fields

**Fix:**
```typescript
.select(`
  id,
  title,
  description,
  price,
  images,
  thumbnail_url,
  created_at,
  status,
  listing_type
`)
```

---

### 10. Client-Side Auth Check in Create Listing
**File:** `web/src/app/create-listing/page.tsx`  
**Lines:** 99-104  
**Severity:** MEDIUM

**Issue:**
Authentication is checked client-side. While this provides UX, server-side validation should also be performed.

```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  router.push('/auth/login');
  return;
}
```

**Risk:**
- Client-side checks can be bypassed
- Should verify on server before allowing listing creation

**Fix:**
Add server-side validation in a route handler or use middleware:
```typescript
// In a server action or route handler
export async function createListing(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Unauthorized' };
  }
  
  // Proceed with creation
}
```

---

### 11. Missing Error Handling in Avatar Upload
**File:** `web/src/components/avatar-upload.tsx`  
**Lines:** 107-115  
**Severity:** MEDIUM

**Issue:**
Avatar upload updates profile without verifying the `userId` matches the authenticated user.

```typescript
const { error: updateError } = await (supabase
  .from('profiles') as any)
  .update({ avatar_url: publicUrl })
  .eq('id', userId);
```

**Risk:**
- If `userId` prop is manipulated, could update wrong user's profile
- Should verify `userId === user.id` before update

**Fix:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user || user.id !== userId) {
  throw new Error('Unauthorized');
}

const { error: updateError } = await supabase
  .from('profiles')
  .update({ avatar_url: publicUrl })
  .eq('id', userId);
```

---

### 12. Console Error Logging Exposes Information
**File:** Multiple files  
**Severity:** MEDIUM

**Issue:**
Multiple `console.error()` calls that could expose sensitive information in production logs.

**Examples:**
- `web/src/app/account/page.tsx:36` - Logs profile errors
- `web/src/app/account/page.tsx:48` - Logs listing errors
- `web/src/app/api/cities/[regionId]/route.ts:32` - Logs Supabase errors with details

**Risk:**
- Error messages could contain sensitive data
- Stack traces could reveal internal structure
- Should use proper logging service

**Fix:**
Use a logging service that sanitizes errors:
```typescript
// Instead of console.error
logger.error('Profile load failed', { 
  userId: user.id, 
  error: sanitizeError(error) 
});
```

---

### 13. Missing Input Sanitization in Listing Description
**File:** `web/src/app/listing/[id]/page.tsx`  
**Line:** 217  
**Severity:** MEDIUM

**Issue:**
Listing description is rendered with `whitespace-pre-line` but no explicit XSS sanitization. React should escape by default, but explicit sanitization is recommended for user-generated content.

```typescript
<p className="whitespace-pre-line text-zinc-700">{listingData.description}</p>
```

**Risk:**
- If description contains HTML, it could be rendered (though React escapes by default)
- Best practice is explicit sanitization

**Fix:**
```typescript
// React escapes by default, but for extra safety:
import DOMPurify from 'isomorphic-dompurify';

<p 
  className="whitespace-pre-line text-zinc-700"
  dangerouslySetInnerHTML={{ 
    __html: DOMPurify.sanitize(listingData.description) 
  }}
/>
// Or better: Keep React's default escaping and just sanitize on save
```

**Note:** React's default behavior should be safe, but explicit sanitization on input is recommended.

---

## Low Severity Issues

### 14. Environment Variable Type Definition Includes Service Role
**File:** `web/src/lib/env.ts`  
**Line:** 1  
**Severity:** LOW

**Issue:**
`SUPABASE_SERVICE_ROLE_KEY` is defined in the type but never used. This is good (not exposed), but the type definition suggests it might be used somewhere.

```typescript
type EnvKey = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "SUPABASE_SERVICE_ROLE_KEY" | "NEXT_PUBLIC_SITE_URL";
```

**Risk:**
- Low risk - key is not used
- Type definition could mislead developers

**Fix:**
Remove from type if not needed, or add comment:
```typescript
// Service role key should NEVER be used in client-side code
// Only for server-side admin operations if absolutely necessary
type EnvKey = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "NEXT_PUBLIC_SITE_URL";
```

---

### 15. Missing Rate Limiting on API Routes
**File:** `web/src/app/api/cities/[regionId]/route.ts`  
**Severity:** LOW

**Issue:**
Public API endpoint without rate limiting could be abused.

**Risk:**
- Could be used for DoS
- No protection against abuse

**Fix:**
Add rate limiting middleware or use Next.js middleware:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function GET(req: Request, { params }: ...) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  
  // ... rest of handler
}
```

---

## Positive Findings

✅ **No Server Actions Found** - No "use server" directives, reducing attack surface  
✅ **No Service Role Key Usage** - Service role key is not used anywhere in client code  
✅ **Proper Supabase Client Separation** - Browser and server clients are properly separated  
✅ **RLS Policies Expected** - Code assumes RLS is enforced (verify in database)  
✅ **No eval() Usage** - No dangerous JavaScript execution found  
✅ **No Direct SQL** - All database access uses Supabase client (parameterized)  

---

## Recommendations

### Immediate Actions (Critical & High)
1. ✅ Move delete/update operations to server-side with explicit authorization
2. ✅ Replace direct `process.env` usage in route handlers
3. ✅ Add input validation and sanitization for user-generated content
4. ✅ Implement rate limiting on public endpoints
5. ✅ Add server-side authorization checks for all mutations

### Short-term (Medium)
1. Replace `select("*")` with explicit field selection
2. Add proper error logging service
3. Implement input sanitization on save operations
4. Add rate limiting to view count updates

### Long-term (Low & Best Practices)
1. Implement comprehensive rate limiting
2. Add security headers (CSP, HSTS, etc.)
3. Set up security monitoring and alerting
4. Regular security audits
5. Implement Content Security Policy (CSP)

---

## Testing Recommendations

1. **Authorization Testing:**
   - Test that users cannot delete/edit listings they don't own
   - Test that unauthenticated users cannot access protected routes

2. **Input Validation Testing:**
   - Test XSS payloads in message content
   - Test SQL injection attempts (though Supabase should protect)
   - Test file upload restrictions

3. **Rate Limiting Testing:**
   - Test API endpoints with high request volumes
   - Test view count manipulation

4. **RLS Policy Verification:**
   - Verify all tables have proper RLS policies
   - Test that policies prevent unauthorized access

---

## Conclusion

The application has a solid security foundation with proper Supabase client usage and separation of concerns. However, several critical authorization issues need immediate attention, particularly around client-side operations that should be server-side. The most urgent fixes are:

1. Server-side authorization for delete/update operations
2. Input validation and sanitization
3. Rate limiting on public endpoints

After addressing these issues, the application will have significantly improved security posture.

---

**Report Generated:** 2025-01-17  
**Next Review:** Recommended in 3 months or after major changes

