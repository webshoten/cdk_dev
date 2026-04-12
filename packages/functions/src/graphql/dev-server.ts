import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
  cors: { origin: ["http://localhost:5173", "http://localhost:3000"] },
});

createServer(yoga).listen(4000, () => {
  console.log("GraphQL: http://localhost:4000/graphql");
});
