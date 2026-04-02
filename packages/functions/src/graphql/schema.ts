import SchemaBuilder from "@pothos/core";

const builder = new SchemaBuilder({});

builder.queryType({
  fields: (t) => ({
    hello: t.string({
      resolve: (ctx) => {
        console.log(ctx);
        console.log("Hello, world!");
        return "Hello, world!";
      },
    }),
    health: t.string({
      resolve: () => new Date().toISOString(),
    }),
  }),
});

export const schema = builder.toSchema();
