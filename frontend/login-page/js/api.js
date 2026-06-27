export async function loginUser(email, password) {
  try {
    const response = await fetch("http://localhost:8080/api/auth/login", {
      //127.0.0.1
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // Check if the response status is not OK (not 200)
    if (!response.ok) {
      // Check if status is 401 (Unauthorized) and the error message is "Invalid credentials"
      const result = await response.json();
      if (
        response.status === 401 &&
        result?.message === "Invalid credentials"
      ) {
        return {
          status: 401,
          data: { message: "Your credentials are wrong", data: null },
        };
      }
      // For other errors, we return the default message
      return {
        status: response.status,
        data: {
          message: result?.message || "Something went wrong",
          data: null,
        },
      };
    }

    const result = await response.json();
    return {
      status: response.status,
      data: result,
    };
  } catch (error) {
    console.error("Login API Error:", error);
    return {
      status: 500,
      data: { message: "Something went wrong", data: null },
    };
  }
}
