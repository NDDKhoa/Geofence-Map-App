# ACT03 - User Authentication Workflow

This diagram illustrates the login and authorization check process.

```mermaid
activityDiagram
    start
    :Enter Credentials (Email/Password);
    :Send Login Request to Backend;
    if (Credentials Valid?) then (yes)
        :Generate JWT Token;
        :Return Token & User Info;
        :Save Token to SecureStorage;
        :Update App State to LoggedIn;
        :Navigate to Home;
    else (no)
        :Show "Invalid Login" Message;
    endif
    stop

    partition "API Request Authorization" {
        :Request Received with Bearer Token;
        if (Token Valid?) then (yes)
            if (User Role >= Required Role?) then (yes)
                :Process Request;
            else (no)
                :Return 403 Forbidden;
            endif
        else (no)
            :Return 401 Unauthorized;
        endif
    }
```
