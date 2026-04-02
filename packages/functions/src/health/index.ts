export const handler = async () => ({
  statusCode: 200,
  body: JSON.stringify({ message: "ok", timestamp: new Date().toISOString() }),
});
