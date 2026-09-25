# Pre-Implementation Trust Boundary Analysis

## Current Flow
generateOTP $\rightarrow$ OTP record in RTDB $\rightarrow$ verifyOTP $\rightarrow$ authorization state $\rightarrow$ resetPassword $\rightarrow$ Firebase Admin password mutation

## Trust Boundary Table

| Value          | Client supplied | Server generated | Server authoritative | Account-bound | Replayable |
| -------------- | --------------- | ---------------- | -------------------- | ------------- | ---------- |
| email          | Yes             | No               | No (User input)       | Yes           | No         |
| trackingId     | Yes (Implied)   | No (Deterministic) | No (Calculated)       | Yes           | Yes        |
| OTP            | Yes (Verify)    | Yes              | Yes                  | Yes           | Yes        |
| expiration     | No              | Yes              | Yes                  | Yes           | No         |
| attempts       | No              | No               | No (RMW pattern)      | Yes           | No         |
| target UID     | No              | No               | Yes (Lookup via email)| Yes           | No         |
| consumed/state | No              | No               | No (Not tracked)      | No            | No         |
| password       | Yes             | No               | Yes                  | Yes           | No         |

## Vulnerability Synthesis
1. **trackingId**: The client effectively controls this via the `email` parameter. Because it is deterministic, an attacker can predict the RTDB path for any user.
2. **attempts**: The server uses a read-modify-write pattern. Concurrent requests can race, allowing more than 3 attempts.
3. **consumed/state**: There is no "CONSUMED" state. `verifyOTP` just checks the code. `resetPassword` repeats the check and then mutates the password. This is redundant and potentially raceable.
4. **target UID**: `resetPassword` performs a new `getUserByEmail(email)` lookup. If the email is changed in the RTDB record but not in the request, it still trusts the request's email.
