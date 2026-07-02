# Security Specification - Firestore Rules for GAMESITEONLINE

This document specifies the security policies, data invariants, and validation cases for our Firebase integration.

## 1. Data Invariants

1. **GameLikes**:
   - A like is represented by a document at `/likes/{userId}_{gameId}`.
   - The user who creates the like must be authenticated and can only write their own UID (`userId == request.auth.uid`).
   - Likes are immutable; they can only be created or deleted, never updated.
   - `createdAt` must be set to `request.time`.

2. **GameStats**:
   - Stores the aggregate `likesCount` for each game at `/games/{gameId}`.
   - Anyone can read game stats (even unauthenticated users).
   - Updates to the `likesCount` must be strictly coupled to the addition or removal of a corresponding like in `/likes/`.
   - On increment: `likesCount` must increase by exactly `1`, and the like document `existsAfter` the transaction.
   - On decrement: `likesCount` must decrease by exactly `1`, and the like document does NOT exist after the transaction.

---

## 2. The "Dirty Dozen" Payloads

Here are 12 malicious payloads designed to test and break our rules. Our security rules will return `PERMISSION_DENIED` for all of these:

1. **Spoofed User Like (Create)**: Authenticated user `user_A` trying to create a like under `user_B`'s ID.
2. **Anonymous Like**: Unauthenticated client attempting to create a like.
3. **Invalid Date Time**: Creating a like with a client-side timestamp instead of the server's `request.time`.
4. **Like Update**: Attempting to update the `gameId` of an existing like.
5. **Like Path Poisoning**: Attempting to create a like with a massive string as the gameId or userId to inflate costs.
6. **Double Increment Stats**: Updating a game's stats to increase `likesCount` by `10` instead of `1`.
7. **Orphaned Stats Increment**: Increasing a game's `likesCount` without creating an accompanying `likes` document.
8. **Unauthorized Stats Reset**: Trying to set `likesCount` to `0` or negative numbers.
9. **Spamming Stats Creation**: Creating a `games` stats document with a negative `likesCount`.
10. **Query Scraper (List likes of other users)**: Trying to read/list all user likes instead of filtering by the signed-in user's UID.
11. **PII Profile Snoop**: Unauthenticated read/get of sensitive user profile details.
12. **Tampering with Game ID**: Attempting to update the `gameId` field inside a game's stats document.

---

## 3. Security Rules Outline

We will implement standard validators:
- `isValidId(id)`: checks standard regex and limits size.
- `isValidLike(data)`: validates like properties and user ownership.
- `isValidStats(data)`: validates games stats schema.
