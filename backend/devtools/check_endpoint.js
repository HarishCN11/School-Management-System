async function testEndpoint() {
    try {
        console.log("Testing POST http://localhost:3000/api/auth/forgot-password ...");
        const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: 'vivekanandhatamilvidyalayam@gmail.com' })
        });

        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Body:", data);
    } catch (error) {
        console.log("Error:", error.message);
    }
}

testEndpoint();
