import SchemaBuilder from "@pothos/core";

const builder = new SchemaBuilder({});

builder.queryType({
  fields: (t) => ({
    hello: t.string({
      resolve: () => "world",
    }),
    health: t.string({
      resolve: () => new Date().toISOString(),
    }),
  }),
});

export const schema = builder.toSchema();
