1. We need a `serviceAccountKey.json` file that can be downloaded from the project settings in Firebase Console or retrieved from AWS Parameter Store using SSM. That file has all the creds to connect to firebase.

2. Frontend sends a token header with the firebase token, which we decode to extract email and uid. To get this token locally without interacting with frontend:

```http
POST https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=FIREBASE_API_KEY
Content-Type: application/json

{
    "email": "youremail@example.com",
    "password": "12345678",
    "returnSecureToken": true
}
```

The response will contain `idToken` that will go into `/users/login` header.