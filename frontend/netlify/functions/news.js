exports.handler = async (event) => {
    try {
        const query = event.queryStringParameters.q || "India";
        const API_KEY = process.env.VITE_NEWS_API_KEY;
        const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // ✅ Allows requests from any domain
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", // ✅ Fix CORS issue for errors too
            },
            body: JSON.stringify({ message: "Error fetching news", error: error.toString() }),
        };
    }
};